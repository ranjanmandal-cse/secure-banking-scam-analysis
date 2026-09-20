from app.services.case_analyzer import CaseAnalyzer


analyzer = CaseAnalyzer()


text = """
BANK SECURITY ALERT

Your bank account will be blocked today.

Verify your account immediately:
http://fake-bank-example.com/verify

Send your OTP to complete verification.

Transaction ID: TXN123456789
Amount: ₹25,000
Phone: 9876543210
"""


result = analyzer.analyze_text(text)


print("\n========== FULL INVESTIGATION ANALYSIS ==========")


print("\n--- Risk Analysis ---")

print(result["risk_analysis"])


print("\n--- Entities ---")

print(result["entities"])


print("\n--- RAG Results ---")

for i, item in enumerate(
    result["rag_results"],
    start=1
):

    print(f"\nResult {i}")

    print("Similarity:", item["score"])

    print(item["text"])


print("\n--- LLM Investigation Reasoning ---")

print(result["llm_reasoning"])