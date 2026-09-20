from pathlib import Path


class TextChunker:

    def __init__(self, chunk_size: int = 500):
        self.chunk_size = chunk_size

    def split_text(self, text: str):

        paragraphs = [
            paragraph.strip()
            for paragraph in text.split("\n\n")
            if paragraph.strip()
        ]

        chunks = []

        current_chunk = ""

        for paragraph in paragraphs:

            if len(current_chunk) + len(paragraph) <= self.chunk_size:

                if current_chunk:
                    current_chunk += "\n\n"

                current_chunk += paragraph

            else:

                if current_chunk:
                    chunks.append(current_chunk)

                current_chunk = paragraph

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def load_and_split(self, file_path: str):

        path = Path(file_path)

        text = path.read_text(
            encoding="utf-8"
        )

        return self.split_text(text)