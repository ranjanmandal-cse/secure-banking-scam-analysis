from app.services.ocr_service import OCRService


ocr = OCRService()

image_path = "test_evidence.png"

text = ocr.extract_text(image_path)

print("\nExtracted Text")
print("--------------")
print(text)