from pathlib import Path

import faiss

from app.rag.chunker import TextChunker
from app.rag.embeddings import EmbeddingService


class RAGRetriever:

    def __init__(self):

        self.knowledge_base_path = (
            Path(__file__).parent
            / "knowledge_base"
            / "banking_scam_guidance.txt"
        )

        self.chunker = TextChunker()

        self.embedding_service = (
            EmbeddingService()
        )

        self.chunks = (
            self.chunker.load_and_split(
                str(self.knowledge_base_path)
            )
        )

        embeddings = (
            self.embedding_service.encode(
                self.chunks
            )
        )

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatIP(
            dimension
        )

        self.index.add(embeddings)

    def search(
        self,
        query: str,
        top_k: int = 3
    ):

        query_embedding = (
            self.embedding_service.encode(
                [query]
            )
        )

        scores, indices = self.index.search(
            query_embedding,
            top_k
        )

        results = []

        for score, index in zip(
            scores[0],
            indices[0]
        ):

            if index == -1:
                continue

            results.append({
                "score": float(score),
                "text": self.chunks[index]
            })

        return results