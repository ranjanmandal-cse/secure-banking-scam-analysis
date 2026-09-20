from PIL import Image
import pytesseract


class OCRService:

    def extract_text(self, image_path: str) -> str:

        image = Image.open(image_path)

        text = pytesseract.image_to_string(image)

        return text.strip()