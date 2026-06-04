import json
import os
from typing import AsyncGenerator

from openai import AsyncOpenAI

import memory as mem
from moderation import moderate
from tools.rag import chatbot_reasoning, TOOL_SCHEMA as RAG_SCHEMA
from tools.calculator import calculate, TOOL_SCHEMA as CALC_SCHEMA  # type: ignore[attr-defined]
from tools.order import take_order, TOOL_SCHEMA as ORDER_SCHEMA

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI()
    return _client

SYSTEM_PROMPT = (
    "You are a helpful food ordering assistant for our restaurant.\n\n"
    "Use the chatbot_reasoning tool for any questions about food items, ingredients, allergens, "
    "availability, or pricing. Do not answer these questions from memory — always use the tool.\n\n"
    "Use the calculator tool only when you need to compute totals, subtotals, or price arithmetic.\n\n"
    "Use the take_order tool when the user has confirmed their order items and you have obtained "
    "the pricing for each item from chatbot_reasoning. Before invoking take_order, you must have: "
    "(1) the list of items and quantities the user wants, and (2) the price of each item. Pass "
    "both the order details and the itemized pricing as input to the tool. Once take_order returns "
    "a confirmation, relay it to the user naturally.\n\n"
    "For general questions unrelated to food, ingredients, pricing, or ordering (e.g. your hours, "
    "general greetings), you may answer directly without using a tool."
)

TOOLS = [RAG_SCHEMA, CALC_SCHEMA, ORDER_SCHEMA]

_RETURN_DIRECT = {"chatbot_reasoning", "take_order"}
MAX_ITERATIONS = 10


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


async def run_agent(session_id: str, user_message: str) -> AsyncGenerator[str, None]:
    block_msg = await moderate(user_message)
    if block_msg:
        yield _sse({"type": "token", "content": block_msg})
        yield "data: [DONE]\n\n"
        return

    mem.add_user(session_id, user_message)
    history = mem.get_history(session_id)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history

    for _ in range(MAX_ITERATIONS):
        content_acc = ""
        tool_calls_acc: dict[int, dict] = {}
        finish_reason: str | None = None

        stream = await _get_client().chat.completions.create(
            model=os.getenv("MODEL_NAME", "gpt-4o-mini"),
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.2,
            max_tokens=600,
            stream=True,
        )

        async for chunk in stream:
            if not chunk.choices:
                continue
            choice = chunk.choices[0]
            if choice.finish_reason:
                finish_reason = choice.finish_reason
            delta = choice.delta

            if delta.content:
                content_acc += delta.content
                if not tool_calls_acc:
                    yield _sse({"type": "token", "content": delta.content})

            if delta.tool_calls:
                for tc in delta.tool_calls:
                    idx = tc.index
                    if idx not in tool_calls_acc:
                        tool_calls_acc[idx] = {"id": "", "name": "", "arguments": ""}
                    if tc.id:
                        tool_calls_acc[idx]["id"] = tc.id
                    if tc.function:
                        if tc.function.name:
                            tool_calls_acc[idx]["name"] = tc.function.name
                        if tc.function.arguments:
                            tool_calls_acc[idx]["arguments"] += tc.function.arguments

        if finish_reason == "stop" or not tool_calls_acc:
            if content_acc:
                mem.add_assistant(session_id, content_acc)
            break

        tool_calls_list = [
            {
                "id": tool_calls_acc[i]["id"],
                "type": "function",
                "function": {
                    "name": tool_calls_acc[i]["name"],
                    "arguments": tool_calls_acc[i]["arguments"],
                },
            }
            for i in sorted(tool_calls_acc)
        ]

        messages.append({
            "role": "assistant",
            "content": content_acc or None,
            "tool_calls": tool_calls_list,
        })

        added_tool_results = False
        for tc in tool_calls_list:
            tool_name = tc["function"]["name"]
            try:
                args = json.loads(tc["function"]["arguments"])
            except json.JSONDecodeError:
                args = {}

            if tool_name == "chatbot_reasoning":
                query = args.get("query", user_message)
                result, chunk_count = await chatbot_reasoning(query)
                yield _sse({"type": "chunks", "count": chunk_count})
                mem.add_assistant(session_id, result)
                yield _sse({"type": "token", "content": result})
                yield "data: [DONE]\n\n"
                return

            elif tool_name == "calculator":
                expression = args.get("expression", "")
                result = calculate(expression)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc["id"],
                    "content": result,
                })
                added_tool_results = True

            elif tool_name == "take_order":
                order_details = args.get("order_details", "")
                result = await take_order(order_details)
                mem.add_assistant(session_id, result)
                mem.update_order(session_id, order_details, result)
                yield _sse({"type": "token", "content": result})
                yield "data: [DONE]\n\n"
                return

        if not added_tool_results:
            break

    yield "data: [DONE]\n\n"
