import json


class ReportService:

    def generate_report(self, case):

        indicators = json.loads(
            case.indicators
        )

        entities = json.loads(
            case.entities
        )

        rag_results = json.loads(
            case.rag_results
        )

        report = {
            "case_information": {
                "case_id": case.case_id,
                "status": case.status,
                "source_type": case.source_type,
                "filename": case.filename,
                "created_at": case.created_at
            },

            "risk_assessment": {
                "risk_score": case.risk_score,
                "risk_level": case.risk_level,
                "indicators": indicators
            },

            "extracted_entities": entities,

            "evidence": {
                "text": case.evidence_text
            },

            "retrieved_guidance": rag_results,

            "investigation_reasoning": (
                case.llm_reasoning
            )
        }

        return report