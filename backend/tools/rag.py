from openai import AsyncOpenAI
import vectorstore as vs

_client: AsyncOpenAI | None = None

_COT_PROMPT = """\
Your task is to answer questions factually about a food menu, provided below and delimited by +++++. The user question is {question}.

Step 1: The first step is to check if the user is asking a question related to any type of food (even if that food item is not on the menu). If the question is about any type of food, we move on to Step 2 and ignore the rest of Step 1. If the question is not about food, then we send a response: "Sorry! I cannot help with that. Please let me know if you have a question about our food menu."

Step 2: In this step, we check that the user question is relevant to any of the items on the food menu. You should check that the food item exists in our menu first. If it doesn't exist then send a kind response to the user that the item doesn't exist in our menu and then include a list of available but similar food items without any other details (e.g., price). The food items available are provided below and delimited by +++++:

+++++

{context}

+++++

Step 3: If the item exists in our food menu and the user is requesting specific information, provide that relevant information to the user using the food menu. Make sure to use a friendly tone and keep the response concise.

Perform the following reasoning steps to send a response to the user:

Step 1: <Step 1 reasoning>

Step 2: <Step 2 reasoning>

Response to the user: <response to user>\
"""

TOOL_NAME = "chatbot_reasoning"
TOOL_DESCRIPTION = (
    "Use this tool to look up information about menu items, food ingredients, allergens, "
    "availability, and pricing. Always call this tool before answering any customer question "
    "about what is on the menu, what something costs, or whether a dish contains a specific "
    "ingredient. Do not answer food-related questions from memory."
)
TOOL_SCHEMA = {
    "type": "function",
    "function": {
        "name": TOOL_NAME,
        "description": TOOL_DESCRIPTION,
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The customer question to look up in the menu knowledge base.",
                }
            },
            "required": ["query"],
        },
    },
}


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI()
    return _client


async def chatbot_reasoning(query: str) -> tuple[str, int]:
    docs, chunk_count = await vs.query(query, n_results=3)
    context = "\n\n".join(docs)
    prompt = _COT_PROMPT.format(question=query, context=context)

    response = await _get_client().chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.9,
        max_tokens=800,
    )

    full_text = response.choices[0].message.content or ""

    if "Response to the user:" in full_text:
        answer = full_text.split("Response to the user:")[-1].strip()
    else:
        answer = full_text.strip()

    return answer, chunk_count
