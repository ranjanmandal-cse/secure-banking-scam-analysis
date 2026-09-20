from sentence_transformers import SentenceTransformer


class EmbeddingService:

    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2"
    ):
        self.model_name = model_name
        self.model = None

    def _load_model(self):
        if self.model is None:
            self.model = SentenceTransformer(
                self.model_name
            )

    def encode(self, texts):

        self._load_model()

        return self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True
        )