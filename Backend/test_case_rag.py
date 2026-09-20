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


print("\n========== CASE + RAG ANALYSIS ==========")


print("\n--- Risk Analysis ---")

print(result["risk_analysis"])


print("\n--- Entities ---")

print(result["entities"])


print("\n--- RAG Results ---")

for i, rag_result in enumerate(
    result["rag_results"],
    start=1
):

    print(f"\nResult {i}")

    print(
        "Similarity:",
        rag_result["score"]
    )

    print(
        rag_result["text"]
    )