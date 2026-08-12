import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma


DATA_DIR = "data"
CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "research_docs"

def load_documents():
    documents = []

    for filename in os.listdir(DATA_DIR):
        path = os.path.join(DATA_DIR, filename)

        if filename.endswith(".pdf"):
            loader = PyPDFLoader(path)
            documents.extend(loader.load())

        elif filename.endswith(".txt"):
            loader = TextLoader(path, encoding="utf-8")
            documents.extend(loader.load())

    return documents



def chunk_documents(documents):
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50, )
    return splitter.split_documents(documents)

def embed_and_store(chunks):
    embeddings = OllamaEmbeddings(model= "nomic-embed-text")

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_DIR,
    )
    return vectorstore


if __name__ == "__main__":
    print("Loading documents...")
    docs = load_documents()
    print(f"  Loaded {len(docs)} document(s)")

    print("Splitting into chunks...")
    chunks = chunk_documents(docs)
    print(f"  Created {len(chunks)} chunk(s)")

    print("Embedding and storing in ChromaDB...")
    embed_and_store(chunks)
    print(f"Done. Vector DB saved to '{CHROMA_DIR}/'")