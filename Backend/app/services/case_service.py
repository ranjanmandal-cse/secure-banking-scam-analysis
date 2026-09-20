import json
import uuid

from sqlalchemy.orm import Session

from app.database.models import InvestigationCase


class CaseService:

    def create_case(
        self,
        db: Session,
        analysis_result: dict
    ) -> InvestigationCase:

        evidence = analysis_result["evidence"]
        entities = analysis_result["entities"]
        risk_analysis = analysis_result["risk_analysis"]

        case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"

        case = InvestigationCase(
            case_id=case_id,

            source_type=evidence["source_type"],

            filename=evidence.get("filename"),

            evidence_text=evidence["text"],

            risk_score=risk_analysis["risk_score"],

            risk_level=risk_analysis["risk_level"],

            indicators=json.dumps(
                risk_analysis["indicators"]
            ),

                        entities=json.dumps(
                entities
            ),

            rag_results=json.dumps(
                analysis_result["rag_results"]
            ),

            llm_reasoning=(
                analysis_result["llm_reasoning"]
            ),

            status="OPEN"
        )

        db.add(case)
        db.commit()
        db.refresh(case)

        return case