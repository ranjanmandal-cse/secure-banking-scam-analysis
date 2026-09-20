import json
import hashlib
import hmac
import os
from dotenv import load_dotenv


from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import InvestigationCase
from app.services.report_service import ReportService

load_dotenv()

ADMIN_PIN = os.getenv("ADMIN_PIN")


router = APIRouter(
    prefix="/cases",
    tags=["Cases"]
)
report_service = ReportService()

class StatusUpdateRequest(BaseModel):

    status: str
class DeleteCaseRequest(BaseModel):
    delete_token: str

class AdminDeleteCaseRequest(BaseModel):
    admin_pin: str

@router.get("")
def get_all_cases(
    db: Session = Depends(get_db)
):

    cases = (
        db.query(InvestigationCase)
        .order_by(
            InvestigationCase.created_at.desc()
        )
        .all()
    )

    return {
        "total": len(cases),

        "cases": [
            {
                "case_id": case.case_id,
                "status": case.status,
                "source_type": case.source_type,
                "filename": case.filename,
                "risk_score": case.risk_score,
                "risk_level": case.risk_level,
                "created_at": case.created_at
            }

            for case in cases
        ]
    }

@router.patch("/{case_id}/status")
def update_case_status(
    case_id: str,
    request: StatusUpdateRequest,
    db: Session = Depends(get_db)
):

    allowed_statuses = {
        "OPEN",
        "UNDER_REVIEW",
        "ESCALATED",
        "RESOLVED",
        "CLOSED"
    }

    if request.status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail="Invalid case status."
        )

    case = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.case_id == case_id
        )
        .first()
    )

    if not case:

        raise HTTPException(
            status_code=404,
            detail="Case not found."
        )

    case.status = request.status

    db.commit()
    db.refresh(case)

    return {
        "case_id": case.case_id,
        "status": case.status
    }

@router.get("/{case_id}/report")
def get_case_report(
    case_id: str,
    db: Session = Depends(get_db)
):

    case = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.case_id == case_id
        )
        .first()
    )

    if not case:

        raise HTTPException(
            status_code=404,
            detail="Case not found."
        )

    return report_service.generate_report(
        case
    )

@router.get("/{case_id}")
def get_case(
    case_id: str,
    db: Session = Depends(get_db)
):

    case = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.case_id == case_id
        )
        .first()
    )

    if not case:

        raise HTTPException(
            status_code=404,
            detail="Case not found."
        )

    return {
        "case_id": case.case_id,
        "status": case.status,

        "source_type": case.source_type,
        "filename": case.filename,

        "evidence_text": case.evidence_text,

        "risk_score": case.risk_score,
        "risk_level": case.risk_level,

        "indicators": json.loads(
            case.indicators
        ),

        "rag_results": json.loads(
            case.rag_results
        ),

        "llm_reasoning": case.llm_reasoning,

        "entities": json.loads(
            case.entities
        ),

        "created_at": case.created_at
    }

@router.delete("/{case_id}/user")
def delete_case_as_user(
    case_id: str,
    request: DeleteCaseRequest,
    db: Session = Depends(get_db)
):

    case = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.case_id == case_id
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found."
        )

    if not case.delete_token_hash:
        raise HTTPException(
            status_code=403,
            detail="This case cannot be deleted by the user."
        )

    provided_token_hash = hashlib.sha256(
        request.delete_token.encode()
    ).hexdigest()

    if not hmac.compare_digest(
        provided_token_hash,
        case.delete_token_hash
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid delete token."
        )

    db.delete(case)
    db.commit()

    return {
        "message": "Case deleted successfully.",
        "case_id": case_id
    }

@router.delete("/{case_id}/admin")
def delete_case_as_admin(
    case_id: str,
    request: AdminDeleteCaseRequest,
    db: Session = Depends(get_db)
):

    if not ADMIN_PIN:
        raise HTTPException(
            status_code=500,
            detail="Admin PIN is not configured."
        )

    if not hmac.compare_digest(
        request.admin_pin,
        ADMIN_PIN
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid admin PIN."
        )

    case = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.case_id == case_id
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found."
        )

    db.delete(case)
    db.commit()

    return {
        "message": "Case deleted successfully by authority.",
        "case_id": case_id
    }