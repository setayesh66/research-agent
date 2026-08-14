from langchain.tools import tool
from app.rag.retriever import get_retriever


_retriever = get_retriever(k=3)


@tool
def search_documents(query: str) -> str:
    """
    Search the internal document knowledge base for information relevant
    to the query. Use this whenever you need facts about store policies,
    pricing, FAQs, or anything from the shop's documents. Do not guess —
    always use this tool to check.
    """
    results = _retriever.invoke(query)
    if not results:
        return "No relevant documents found"

    formatted = []
    for doc in results:
        source = doc.metadata.get("source", "unknown")
        formatted.append(f"[source:{source}] \n {doc.page_content}")

    return "\n\n---\n\n".join(formatted)