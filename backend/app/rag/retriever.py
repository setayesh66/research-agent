from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma

CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "research_docs"

def get_retriever(k: int=3):
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    vectorstore = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=CHROMA_DIR,
    )
    return vectorstore.as_retriever(search_kwargs={"k": k})


if __name__ == "__main__":
    retriever = get_retriever(k=3)

    test_questions = [
        "What is your return policy?",
        "Can I resize a ring?",
        "Do you offer financing?",
    ]

    for question in test_questions:
        print(f"\nQuestion: {question}")
        print("-" * 50)
        results = retriever.invoke(question)
        for i, doc in enumerate(results, 1):
            source = doc.metadata.get("source", "unknown")
            print(f"  [{i}] (from {source})")
            print(f"      {doc.page_content[:150]}...")