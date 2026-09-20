from app.services.entity_extractor import EntityExtractor


extractor = EntityExtractor()


text = """
Your SBI account will be blocked today.

Click https://fake-sbi-login.com/verify

Send OTP 483921 immediately.

UPI ID: scammer@upi

Call 9876543210.

Transaction ID: TXN123456789

Amount: ₹25,000
"""


result = extractor.extract(text)


print("\nExtracted Entities")
print("------------------")

for entity_type, values in result.items():

    print(f"{entity_type}: {values}")