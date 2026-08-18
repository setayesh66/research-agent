from langchain.tools import tool
from app.rag.retriever import get_retriever
from langchain_ollama import ChatOllama


_retriever = get_retriever(k=3)
_rewrite_llm = ChatOllama(model="qwen3:8b", temperature=0)



def _rewrite_query(raw_query: str) -> str:
    """Rewrite a user's question into a clearer search query before embedding it."""
    prompt = f"""Rewrite the following user question into a short, clear search query optimized for finding relevant documents. 
    Keep it focused on key terms. Only output the rewritten query, nothing else.

    User question: {raw_query}

    Rewritten query:"""
    response = _rewrite_llm.invoke(prompt)
    # return response.content.strip()
    rewritten = response.content.strip()
    print(f"  [query rewrite] '{raw_query}' -> '{rewritten}'")
    return rewritten


@tool
def search_documents(query: str) -> str:
    """Search the internal document knowledge base for information relevant to the query. 
    Use this whenever you need facts about Haloforge's API, pricing, rate limits, error codes, 
    or support policies. Do not guess, always use this tool to check."""

    rewritten = _rewrite_query(query)
    results = _retriever.invoke(rewritten)

    if not results:
        return "No relevant documents found"

    formatted = []
    for doc in results:
        source = doc.metadata.get("source", "unknown")
        formatted.append(f"[source:{source}] \n {doc.page_content}")

    return "\n\n---\n\n".join(formatted)