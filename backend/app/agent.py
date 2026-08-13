from langchain_ollama import ChatOllama
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.tools.document_search import search_documents

MODEL = "qwen3:8b"

SYSTEM_PROMPT = """You are a helpful assistant for Aurora Jewelry Shop.
Answer questions using the search_documents tool to find accurate information
from the shop's internal documents. Do not make up policies, prices, or facts —
always search first. If the documents don't contain the answer, say so honestly."""


def build_agent():
    llm = ChatOllama(model=MODEL, temperature=0)

    tools = [search_documents]

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder("chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)

    executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,       
        max_iterations=5,  
    )
    return executor


if __name__ == "__main__":
    executor = build_agent()
    print("Aurora Jewelry Agent (type 'quit' to exit)\n")

    chat_history = []
    while True:
        user_input = input("You: ")
        if user_input.lower() in ("quit", "exit"):
            break

        response = executor.invoke({
            "input": user_input,
            "chat_history": chat_history,
        })

        answer = response["output"]
        print(f"\nAgent: {answer}\n")

        chat_history.append(("human", user_input))
        chat_history.append(("ai", answer))