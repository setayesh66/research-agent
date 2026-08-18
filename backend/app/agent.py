from dotenv import load_dotenv
load_dotenv()

from langchain_ollama import ChatOllama
from langchain.agents import create_agent
from app.tools.document_search import search_documents
from app.tools.web_search import web_search


MODEL = "qwen3:8b"

SYSTEM_PROMPT = """You are a helpful technical support assistant for Haloforge, a cloud storage and API platform.
You have two tools available:
- search_documents: use this for questions about Haloforge's API reference, pricing, rate limits, error codes, or support FAQ.
- web_search: use this for general knowledge or current-events questions unrelated to Haloforge's own documentation.
Always pick the tool that matches the question. Do not make up answers — always search first."""


def build_agent():
    llm = ChatOllama(model=MODEL, temperature=0)

    agent = create_agent(
        model=llm,
        tools=[search_documents, web_search],
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