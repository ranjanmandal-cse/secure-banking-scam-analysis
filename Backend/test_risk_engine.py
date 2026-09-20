from app.services.risk_engine import RiskEngine


engine = RiskEngine()

text = """
Your bank account will be blocked today.

Verify your account immediately:
http://example.com/verify

Send your OTP to complete verification.
"""

result = engine.analyze(text)

print(result)