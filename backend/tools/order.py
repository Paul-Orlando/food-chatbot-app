from openai import AsyncOpenAI
from moderation import moderate

_client: AsyncOpenAI | None = None

TOOL_NAME = "take_order"
TOOL_DESCRIPTION = (
    "Use this tool only after you have confirmed with the user exactly which items they want "
    "and their quantities, AND after you have retrieved the price for each item using "
    "chatbot_reasoning. Pass the full order details including item names, quantities, and "
    "prices as input. Do not invoke this tool if pricing information is missing."
)
TOOL_SCHEMA = {
    "type": "function",
    "function": {
        "name": TOOL_NAME,
        "description": TOOL_DESCRIPTION,
        "parameters": {
            "type": "object",
            "properties": {
                "order_details": {
                    "type": "string",
                    "description": (
                        "Full order details including item names, quantities, and prices. "
                        "Example: '2x Bruschetta at $9.99 each, 1x Tiramisu at $8.99'"
                    ),
                }
            },
            "required": ["order_details"],
        },
    },
}

_SYSTEM_PROMPT = (
    "You are an order processing assistant. Your job is to confirm and finalize a food order.\n\n"
    "You will receive the order details as input, which should include the items ordered, their "
    "quantities, and the price of each item. Review the order details provided and present a "
    "clear, friendly order summary to the user showing each item, quantity, and price, along "
    "with the total. Then confirm the order is placed.\n\n"
    "If the order details are incomplete (missing items or prices), state what is missing and "
    "ask the calling agent to provide it before proceeding. Do not ask the user for credit card "
    "or delivery information — assume that is already on file."
)


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI()
    return _client


async def take_order(order_details: str) -> str:
    block_msg = await moderate(order_details)
    if block_msg:
        return block_msg

    response = await _get_client().chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": order_details},
        ],
        temperature=0.2,
        max_tokens=600,
    )
    return response.choices[0].message.content or ""
