import pymupdf

class PDFService:

    def extract_text(self, pdf_path: str) -> str:

        document = pymupdf.open(pdf_path)

        pages = []

        for page in document:
            text = page.get_text()

            if text:
                pages.append(text)

        document.close()

        return "\n".join(pages).strip()