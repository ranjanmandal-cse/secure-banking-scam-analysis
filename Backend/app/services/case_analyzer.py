from app.services.input_processor import InputProcessor
from app.services.entity_extractor import EntityExtractor
from app.services.risk_engine import RiskEngine
from app.services.llm_service import LLMService
from app.rag.retriever import RAGRetriever


class CaseAnalyzer:

    def __init__(self):

        self.input_processor = InputProcessor()

        self.entity_extractor = EntityExtractor()

        self.risk_engine = RiskEngine()

        self.rag_retriever = RAGRetriever()

        self.llm_service = LLMService()

    def analyze_text(self, text: str) -> dict:

        evidence = self.input_processor.process_text(
            text
        )

        extracted_text = evidence["text"]

        entities = self.entity_extractor.extract(
            extracted_text
        )

        risk_analysis = self.risk_engine.analyze(
            extracted_text
        )

        rag_results = self.rag_retriever.search(
            extracted_text,
            top_k=3
        )

        llm_reasoning = (
            self.llm_service
            .generate_investigation_reasoning(
                evidence_text=extracted_text,
                risk_analysis=risk_analysis,
                rag_results=rag_results
            )
        )

        return {
            "evidence": evidence,

            "entities": entities,

            "risk_analysis": risk_analysis,

            "rag_results": rag_results,

            "llm_reasoning": llm_reasoning
        }

    def analyze_file(self, file_path: str) -> dict:

        evidence = self.input_processor.process_file(
            file_path
        )

        extracted_text = evidence["text"]

        entities = self.entity_extractor.extract(
            extracted_text
        )

        risk_analysis = self.risk_engine.analyze(
            extracted_text
        )

        rag_results = self.rag_retriever.search(
            extracted_text,
            top_k=3
        )

        llm_reasoning = (
            self.llm_service
            .generate_investigation_reasoning(
                evidence_text=extracted_text,
                risk_analysis=risk_analysis,
                rag_results=rag_results
            )
        )

        return {
            "evidence": evidence,

            "entities": entities,

            "risk_analysis": risk_analysis,

            "rag_results": rag_results,

            "llm_reasoning": llm_reasoning
        }