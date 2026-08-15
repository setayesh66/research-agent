import os
from dotenv import load_dotenv
from langchain.tools import tool
from tavily import TavilyClient

load_dotenv()

_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


@tool
def web_search(query: str) -> str:
    """Search the web for current, real-world information not found in the shop's internal documents. Use this for general knowledge questions, current events, or anything unrelated to Aurora Jewelry Shop's own policies and products."""
    response = _client.search(query, max_results=3)
    results = response.get("results", [])
    if not results:
        return "No web results found."

    formatted = []
    for r in results:
        title = r.get("title", "Untitled")
        content = r.get("content", "")
        url = r.get("url", "")
        formatted.append(f"[{title}]({url})\n{content}")

    return "\n\n---\n\n".join(formatted)