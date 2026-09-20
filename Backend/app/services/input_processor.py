from pathlib import Path

from app.services.ocr_service import OCRService
from app.services.pdf_service import PDFService


class InputProcessor:

    SUPPORTED_TEXT = {".txt"}
    SUPPORTED_IMAGES = {".png", ".jpg", ".jpeg", ".webp"}
    SUPPORTED_PDFS = {".pdf"}

    def __init__(self):
        self.ocr_service = OCRService()
        self.pdf_service = PDFService()

    def process_text(self, text: str) -> dict:

        if not text or not text.strip():
            raise ValueError("Text evidence cannot be empty.")

        cleaned_text = text.strip()

        return {
            "source_type": "text",
            "text": cleaned_text,
            "metadata": {
                "character_count": len(cleaned_text),
                "word_count": len(cleaned_text.split())
            }
        }

    def process_file(self, file_path: str) -> dict:

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        extension = path.suffix.lower()

        # Text file
        if extension in self.SUPPORTED_TEXT:

            text = path.read_text(
                encoding="utf-8"
            )

            return {
                "source_type": "text_file",
                "text": text.strip(),
                "filename": path.name
            }

        # Image file
        if extension in self.SUPPORTED_IMAGES:

            text = self.ocr_service.extract_text(
                str(path)
            )

            return {
                "source_type": "image",
                "text": text,
                "filename": path.name
            }

        # PDF file
        if extension in self.SUPPORTED_PDFS:

            text = self.pdf_service.extract_text(
                str(path)
            )

            return {
                "source_type": "pdf",
                "text": text,
                "filename": path.name
            }

        raise ValueError(
            f"Unsupported file type: {extension}"
        )