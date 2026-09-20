from app.services.pdf_service import PDFService


pdf_service = PDFService()

pdf_path = "test_evidence.pdf"

text = pdf_service.extract_text(pdf_path)

print("\nExtracted PDF Text")
print("------------------")
print(text)