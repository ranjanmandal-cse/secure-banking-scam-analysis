from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import InvestigationCase


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db)
):

    total_cases = (
        db.query(InvestigationCase)
        .count()
    )

    high_risk_cases = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.risk_level == "HIGH"
        )
        .count()
    )

    medium_risk_cases = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.risk_level == "MEDIUM"
        )
        .count()
    )

    low_risk_cases = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.risk_level == "LOW"
        )
        .count()
    )

    open_cases = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.status == "OPEN"
        )
        .count()
    )

    under_review_cases = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.status == "UNDER_REVIEW"
        )
        .count()
    )

    escalated_cases = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.status == "ESCALATED"
        )
        .count()
    )

    resolved_cases = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.status == "RESOLVED"
        )
        .count()
    )

    closed_cases = (
        db.query(InvestigationCase)
        .filter(
            InvestigationCase.status == "CLOSED"
        )
        .count()
    )

    return {
        "total_cases": total_cases,

        "risk_distribution": {
            "high": high_risk_cases,
            "medium": medium_risk_cases,
            "low": low_risk_cases
        },

        "status_distribution": {
            "open": open_cases,
            "under_review": under_review_cases,
            "escalated": escalated_cases,
            "resolved": resolved_cases,
            "closed": closed_cases
        }
    }