from fastapi import APIRouter
from pydantic import BaseModel

from app.services.llm_service import LLMService


router = APIRouter(
    prefix="/assistant",
    tags=["AI Assistant"]
)

llm_service = LLMService()


class AssistantRequest(BaseModel):

    question: str
    evidence_text: str
    risk_analysis: dict
    llm_reasoning: str


@router.post("/ask")
def ask_assistant(request: AssistantRequest):

    prompt = f"""
You are an AI assistant for a banking fraud investigation system.

You help users understand banking scams, fraud prevention, and investigation results.

Case context may or may not be available.

Evidence:
{request.evidence_text}

Risk Analysis:
{request.risk_analysis}

Investigation Reasoning:
{request.llm_reasoning}

User Question:
{request.question}

Instructions:

1. If case evidence, risk analysis, or investigation reasoning is provided,
   answer questions about that case using the provided information.

2. If no case information is provided, answer general questions about
   banking scams, fraud prevention, suspicious messages, and safe banking
   practices using your general knowledge.

3. Never invent case-specific facts.

4. Never change, calculate, or reinterpret the provided risk score.

5. If the user asks why a specific message or case is risky but no case
   information is available, explain that case-specific evidence is needed.

6. Give a concise, clear and helpful answer.
"""

    answer = llm_service.generate_response(prompt)

    return {
        "answer": answer
    }