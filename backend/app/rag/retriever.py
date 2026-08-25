from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from sentence_transformers import CrossEncoder


_reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")


def get_retriever(k: int=3, fetch_k: int=7):
    """
    Returns a retriever that fetches fetch_k candidates by vector similarity,
    then re-ranks them with a cross-encoder and returns the top k.
    """

    vectorstore= Chroma(
        collection_name="research_docs",
        embedding_function= OllamaEmbeddings(model="nomic-embed-text"),
        persist_directory="chroma_db",
    )

    base_retriever = vectorstore.as_retriever(search_kwargs={"k": fetch_k})

    class RerankingRetriever:
        def invoke(self, query:str):
            candidates= base_retriever.invoke(query)
            if not candidates:
                return []

            pairs=[]
            for doc in candidates:
                pair = [query, doc.page_content]
                pairs.append(pair)

            scores= _reranker.predict(pairs)
            paired= list(zip(candidates, scores))
            scored = sorted(paired, key=lambda x: x[1], reverse=True)
            return [doc for doc, score in scored[:k]]

    return RerankingRetriever()


















# def get_retriever(k: int = 3, fetch_k: int = 7):
#     """
#     Returns a retriever that fetches fetch_k candidates by vector similarity,
#     then re-ranks them with a cross-encoder and returns the top k.
#     """
#     embeddings = OllamaEmbeddings(model="nomic-embed-text")
#     vectorstore = Chroma(
#         collection_name=COLLECTION_NAME,
#         embedding_function=embeddings,
#         persist_directory=CHROMA_DIR,
#     )
#     base_retriever = vectorstore.as_retriever(search_kwargs={"k": fetch_k})
#     # return vectorstore.as_retriever(search_kwargs={"k": k})


#     class RerankingRetriever:
#         def invoke(self, query: str):
#             candidates = base_retriever.invoke(query)
#             if not candidates:
#                 return []

#             # pairs = [[query, doc.page_content] for doc in candidates]
#             pairs = []

#             for doc in candidates:
#                 pair = [query, doc.page_content]
#                 pairs.append(pair)
#             scores = _reranker.predict(pairs)

#             scored = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
#             return [doc for doc, score in scored[:k]]

#     return RerankingRetriever()

