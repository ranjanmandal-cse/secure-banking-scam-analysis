import re


class RiskEngine:

    def __init__(self):

        self.rules = {
            "suspicious_url": {
                "score": 30,
                "keywords": [
                    "http://",
                    "https://",
                    "bit.ly",
                    "tinyurl",
                    "verify-account",
                    "account-verification",
                    "secure-login",
                ],
            },

            "urgent_language": {
                "score": 20,
                "keywords": [
                    "urgent",
                    "immediately",
                    "act now",
                    "within 24 hours",
                    "today",
                    "blocked",
                    "suspended",
                    "expire",
                ],
            },

            "otp_request": {
                "score": 25,
                "keywords": [
                    "otp",
                    "one time password",
                    "pin",
                    "cvv",
                    "password",
                ],
            },

            "bank_account_threat": {
                "score": 15,
                "keywords": [
                    "bank account",
                    "account blocked",
                    "account suspended",
                    "account will be blocked",
                    "security threat",
                    "unauthorized transaction",
                ],
            },
        }

    def analyze(self, text: str):

        text_lower = text.lower()

        indicators = []
        total_score = 0

        # Check each rule
        for rule_name, rule in self.rules.items():

            matched = False

            for keyword in rule["keywords"]:

                if keyword in text_lower:

                    # Check whether sensitive keywords
                    # are being used in a legitimate warning.
                    negation_patterns = [
                        "never ask you to share",
                        "never ask for",
                        "do not share",
                        "don't share",
                        "will never ask for",
                        "will never ask you to share",
                        "never share",
                    ]

                    is_negated = any(
                        pattern in text_lower
                        for pattern in negation_patterns
                    )

                    if is_negated:
                        matched = False
                        break

                    matched = True
                    break

            if matched:

                indicators.append({
                    "name": self._format_name(rule_name),
                    "score": rule["score"],
                    "description": self._get_description(rule_name),
                })

                total_score += rule["score"]

        # Maximum score = 100
        total_score = min(total_score, 100)

        risk_level = self._get_risk_level(total_score)

        return {
            "risk_score": total_score,
            "risk_level": risk_level,
            "indicators": indicators,
        }

    def _get_risk_level(self, score: int):

        if score >= 70:
            return "HIGH"

        elif score >= 40:
            return "MEDIUM"

        else:
            return "LOW"

    def _format_name(self, rule_name: str):

        names = {
            "suspicious_url": "Suspicious URL",
            "urgent_language": "Urgent language",
            "otp_request": "OTP request",
            "bank_account_threat": "Bank/account threat",
        }

        return names.get(rule_name, rule_name)

    def _get_description(self, rule_name: str):

        descriptions = {
            "suspicious_url":
                "Suspicious link detected",

            "urgent_language":
                "Contains urgent action language",

            "otp_request":
                "Requests OTP, PIN or sensitive information",

            "bank_account_threat":
                "Mentions account block or security threat",
        }

        return descriptions.get(rule_name, "")