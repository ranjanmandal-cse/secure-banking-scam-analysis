import ollama


class LLMService:

    def __init__(
        self,
        model_name: str = "llama3.2:3b"
    ):

        self.model_name = model_name

    def generate_investigation_reasoning(
        self,
        evidence_text: str,
        risk_analysis: dict,
        rag_results: list
    ):

        context = "\n\n".join(
            [
                result["text"]
                for result in rag_results
            ]
        )

        indicators = "\n".join(
            [
                f"- {item['name']}: "
                f"{item['description']} "
                f"(+{item['score']})"
                for item in risk_analysis["indicators"]
            ]
        )

        prompt = f"""
You are an AI assistant supporting a banking scam investigator.

Analyze the provided evidence using ONLY:
1. The evidence text
2. The deterministic risk analysis
3. The retrieved investigation guidance

Do not invent facts.

Do not change or recalculate the risk score.

Provide a concise investigation explanation containing:

- Summary
- Observed suspicious indicators
- Evidence supporting the indicators
- Relevant guidance
- Recommended investigator action

Evidence:
{evidence_text}

Deterministic Risk Analysis:
Risk Score: {risk_analysis["risk_score"]}
Risk Level: {risk_analysis["risk_level"]}

Indicators:
{indicators}

Retrieved Guidance:
{context}
"""

        response = ollama.chat(
            model=self.model_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response["message"]["content"]


    def generate_response(self, prompt: str):

        response = ollama.chat(
            model=self.model_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response["message"]["content"]