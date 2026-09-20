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
You are an AI assistant helping a banking fraud investigator.

Answer the investigator's question using ONLY the case information provided below.

Evidence:
{request.evidence_text}

Risk Analysis:
{request.risk_analysis}

Investigation Reasoning:
{request.llm_reasoning}

Investigator Question:
{request.question}

Give a concise, clear and evidence-based answer.
Do not invent facts that are not present in the case.
"""

    answer = llm_service.generate_response(prompt)

    return {
        "answer": answer
    }