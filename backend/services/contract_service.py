import io
import logging
import time
from datetime import datetime, timezone

import pdfplumber
from fastapi import UploadFile
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.models.analysis import Analysis
from backend.models.contract import Contract
from backend.services.ai_service import AIService, ContractAnalysisError

logger = logging.getLogger(__name__)


def create_contract_from_text(
    db: Session, user_id: int, title: str, content: str
) -> Contract:
    contract = Contract(
        user_id=user_id,
        title=title,
        content_text=content,
        upload_type="text",
        status="pending",
        file_size=len(content.encode("utf-8")),
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return contract


def create_contract_from_pdf(
    db: Session, user_id: int, title: str, file: UploadFile
) -> Contract:
    file_bytes = file.file.read()
    file_size = len(file_bytes)

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise ValueError(
            f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB}MB"
        )

    # Extract text from PDF
    text_parts = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {e}")

    if not text_parts:
        raise ValueError(
            "Could not extract any text from the PDF. "
            "The file may be image-based or corrupted."
        )

    content_text = "\n\n".join(text_parts)

    contract = Contract(
        user_id=user_id,
        title=title,
        filename=file.filename,
        content_text=content_text,
        file_size=file_size,
        upload_type="pdf",
        status="pending",
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return contract


def get_user_contracts(
    db: Session, user_id: int, skip: int = 0, limit: int = 50
) -> list[Contract]:
    return (
        db.query(Contract)
        .filter(Contract.user_id == user_id)
        .order_by(Contract.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_contract(db: Session, contract_id: int, user_id: int) -> Contract | None:
    return (
        db.query(Contract)
        .filter(Contract.id == contract_id, Contract.user_id == user_id)
        .first()
    )


def delete_contract(db: Session, contract_id: int, user_id: int) -> bool:
    contract = get_contract(db, contract_id, user_id)
    if not contract:
        return False
    db.delete(contract)
    db.commit()
    return True


def analyze_contract(
    db: Session, contract_id: int, user_id: int, ai: AIService
) -> Analysis:
    contract = get_contract(db, contract_id, user_id)
    if not contract:
        raise ValueError("Contract not found")

    if contract.status == "analyzing":
        raise ValueError("Contract is already being analyzed")

    # Delete any existing analysis for re-analysis
    existing = (
        db.query(Analysis).filter(Analysis.contract_id == contract_id).first()
    )
    if existing:
        db.delete(existing)
        db.commit()

    # Update status
    contract.status = "analyzing"
    db.commit()

    start_time = time.time()

    try:
        result = ai.analyze_contract(contract.content_text)
    except ContractAnalysisError as e:
        contract.status = "failed"
        db.commit()
        raise

    duration_ms = int((time.time() - start_time) * 1000)

    analysis = Analysis(
        contract_id=contract_id,
        overall_risk_score=result["overall_risk_score"],
        overall_risk_level=result["overall_risk_level"],
        summary=result["summary"],
        contract_type=result["contract_type"],
        key_dates=result.get("key_dates"),
        parties=result.get("parties"),
        clauses=result["clauses"],
        suggestions=result["suggestions"],
        raw_ai_response=result.get("_raw_response"),
        analysis_duration_ms=duration_ms,
    )

    db.add(analysis)
    contract.status = "completed"
    contract.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(analysis)

    return analysis
