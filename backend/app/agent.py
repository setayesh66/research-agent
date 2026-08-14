from langchain_ollama import ChatOllama
from langchain.agents import create_agent
from app.tools.document_search import search_documents

MODEL = "qwen3:8b"

SYSTEM_PROMPT = """You are a helpful assistant for Aurora Jewelry Shop.
Answer questions using the search_documents tool to find accurate information
from the shop's internal documents. Do not make up policies, prices, or facts —
always search first. If the documents don't contain the answer, say so honestly."""


def build_agent():
    llm = ChatOllama(model=MODEL, temperature=0)

    agent = create_agent(
        model=llm,
        tools=[search_documents],
        system_prompt=SYSTEM_PROMPT,
    )
    return agent


if __name__ == "__main__":
    agent = build_agent()
    print("Aurora Jewelry Agent (type 'quit' to exit)\n")

    messages = []
    while True:
        user_input = input("You: ")
        if user_input.lower() in ("quit", "exit"):
            break

        messages.append({"role": "user", "content": user_input})

        result = agent.invoke({"messages": messages})
        final_message = result["messages"][-1]
        print(f"\nAgent: {final_message.content}\n")

        messages = result["messages"] 