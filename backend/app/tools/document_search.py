from langchain.tools import tool
from app.rag.retriever import retriever

_retriever = retriever(k=3)


@tool
def search_documents(query: str) -> str:
    results= _retriever.invoke(query)
    if not results:
        return "No relevant documents found"

    formatted= []
    for doc in results:
        source= doc.metadata.get("data", "unknown")
        formatted.append(f"[source:{source}] \n {doc.page_content}")

    return "\n\n---\n\n".join(formatted)