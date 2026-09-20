from app.services.llm_service import LLMService


llm = LLMService()


evidence = """
Your bank account will be blocked today.
Verify your account immediately.
Send your OTP to complete verification.
"""


risk_analysis = {
    "risk_score": 75,
    "risk_level": "HIGH",
    "indicators": [
        {
            "name": "Urgent language",
            "score": 20,
            "description": "Contains urgent action language"
        },
        {
            "name": "OTP request",
            "score": 25,
            "description": "Requests OTP or sensitive information"
        }
    ]
}


rag_results = [
    {
        "score": 0.65,
        "text": """
Banks generally do not ask customers to disclose
OTPs, PINs, CVVs, or passwords through unsolicited
messages or calls.
"""
    },
    {
        "score": 0.50,
        "text": """
Scam messages frequently use urgency or threats
such as account suspension or account blocking.
"""
    }
]


result = llm.generate_investigation_reasoning(
    evidence,
    risk_analysis,
    rag_results
)


print("\n========== LLM INVESTIGATION REASONING ==========\n")

print(result)