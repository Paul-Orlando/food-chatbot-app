import os
import pathlib
import chromadb
from openai import AsyncOpenAI

COLLECTION_NAME = "bella_vista_menu"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100
EMBED_MODEL = "text-embedding-3-small"

_openai_client: AsyncOpenAI | None = None
_chroma: chromadb.Collection | None = None


def _get_client() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = AsyncOpenAI()
    return _openai_client


def _split_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return [c.strip() for c in chunks if c.strip()]


async def _embed(texts: list[str]) -> list[list[float]]:
    response = await _get_client().embeddings.create(model=EMBED_MODEL, input=texts)
    return [item.embedding for item in response.data]


async def init_vectorstore() -> chromadb.Collection:
    global _chroma
    chroma_path = os.getenv("CHROMA_PATH", "./chroma_db")
    db = chromadb.PersistentClient(path=chroma_path)

    try:
        collection = db.get_collection(COLLECTION_NAME)
        if collection.count() > 0:
            _chroma = collection
            print(f"[vectorstore] Loaded existing collection ({collection.count()} chunks)")
            return collection
        db.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = db.create_collection(
        COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    menu_path = pathlib.Path(__file__).parent / "menu.txt"
    menu_text = menu_path.read_text(encoding="utf-8")
    chunks = _split_text(menu_text)

    batch_size = 10
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        embeddings = await _embed(batch)
        collection.add(
            documents=batch,
            embeddings=embeddings,
            ids=[f"chunk_{i + j}" for j in range(len(batch))],
            metadatas=[{"chunk_index": i + j} for j in range(len(batch))],
        )

    print(f"[vectorstore] Ingested {len(chunks)} chunks from menu.txt")
    _chroma = collection
    return collection


async def query(text: str, n_results: int = 3) -> tuple[list[str], int]:
    if _chroma is None:
        raise RuntimeError("Vector store not initialized. Call init_vectorstore() first.")
    embedding_response = await _get_client().embeddings.create(model=EMBED_MODEL, input=text)
    query_embedding = embedding_response.data[0].embedding
    results = _chroma.query(query_embeddings=[query_embedding], n_results=n_results)
    docs = results["documents"][0]
    return docs, len(docs)
