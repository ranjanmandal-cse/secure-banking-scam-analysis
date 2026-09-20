import json
import uuid
import shutil
from PIL import Image

from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import InvestigationCase
from app.services.case_analyzer import CaseAnalyzer
from app.services.whisper_service import WhisperService


router = APIRouter(
    prefix="/upload",
    tags=["Evidence Upload"]
)

case_analyzer = CaseAnalyzer()
whisper_service = WhisperService()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

ALLOWED_EXTENSIONS = {
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".pdf",
    ".wav",
    ".mp3",
    ".m4a",
    ".mp4",
    ".webm",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/analyze")
async def upload_and_analyze(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is missing."
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {extension}"
        )

    safe_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / safe_filename

    try:

        # Save uploaded file
        total_size = 0
        with file_path.open("wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                  file_path.unlink(missing_ok=True)
                  raise HTTPException(
                    status_code=413,
                    detail="File is too large. Maximum allowed size is 10 MB"
                  )
                buffer.write(chunk)

        # Analyze uploaded evidence
        if extension in {
            ".wav",
            ".mp3",
            ".m4a",
            ".mp4",
            ".webm",
        }:

            transcribed_text = whisper_service.transcribe(
                str(file_path)
            )

            result = case_analyzer.analyze_text(
                transcribed_text
            )

            result["evidence"]["source_type"] = "audio"
            result["evidence"]["filename"] = file.filename

        else:

            result = case_analyzer.analyze_file(
                str(file_path)
            )

        evidence = result["evidence"]
        entities = result["entities"]
        risk_analysis = result["risk_analysis"]
        rag_results = result["rag_results"]
        llm_reasoning = result["llm_reasoning"]

        # Generate case ID
        case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"

        # Create database case
        case = InvestigationCase(
            case_id=case_id,

            status="OPEN",

            source_type=evidence.get(
                "source_type",
                extension.replace(".", "")
            ),

            filename=file.filename,

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

        return {
            "case_id": case.case_id,
            **result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )