from fastapi import FastAPI
from pydantic import BaseModel

import json
import uuid
import secrets
import hashlib

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import InvestigationCase
from fastapi.middleware.cors import CORSMiddleware

from app.services.case_analyzer import CaseAnalyzer
case_analyzer = CaseAnalyzer()
from app.api.routes.upload import router as upload_router
from app.api.routes.cases import router as cases_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes import assistant

from app.database.database import Base, engine
from app.database import models

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Secure Banking Scam Analysis",
    description="AI-assisted banking scam investigation system",
    version="1.0.0"
)

app.include_router(upload_router)
app.include_router(cases_router)
app.include_router(dashboard_router)
app.include_router(assistant.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str


@app.get("/")
def root():
    return {
        "message": "Secure Banking Scam Analysis API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/analyze")
def analyze(
    request: AnalyzeRequest,
    db: Session = Depends(get_db)
):

    # Run the existing analysis pipeline
    result = case_analyzer.analyze_text(
        request.text
    )

    # Generate a unique case ID
    case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"

    # Extract analysis components
    evidence = result["evidence"]
    entities = result["entities"]
    risk_analysis = result["risk_analysis"]
    rag_results = result["rag_results"]
    llm_reasoning = result["llm_reasoning"]

    delete_token = secrets.token_urlsafe(32)
    delete_token_hash = hashlib.sha256(
        delete_token.encode()
    ).hexdigest()

    # Create database case
    case = InvestigationCase(

        case_id=case_id,
        delete_token_hash=delete_token_hash,

        status="OPEN",

        source_type=evidence.get(
            "source_type",
            "text"
        ),

        filename=evidence.get(
            "filename"
        ),

        evidence_text=evidence.get(
            "text",
            ""
        ),

        risk_score=risk_analysis.get(
            "risk_score",
            0
        ),

        risk_level=risk_analysis.get(
            "risk_level",
            "LOW"
        ),

        indicators=json.dumps(
            risk_analysis.get(
                "indicators",
                []
            )
        ),

        entities=json.dumps(
            entities
        ),

        rag_results=json.dumps(
            rag_results
        ),

        llm_reasoning=llm_reasoning
    )

    # Save case
    db.add(case)
    db.commit()
    db.refresh(case)

    # Return analysis + case ID
    return {
    "case_id": case.case_id,

    "delete_token": delete_token,

    **result
}