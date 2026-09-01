import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.models.user import User
from backend.schemas.contract import (
    ContractDetailResponse,
    ContractResponse,
    ContractUploadText,
)
from backend.schemas.analysis import AnalysisResponse, ClauseAnalysis
from backend.services import contract_service
from backend.services.ai_service import ContractAnalysisError, ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/contracts", tags=["contracts"])


def _build_detail_response(contract) -> dict:
    """Build a ContractDetailResponse dict from a Contract ORM object."""
    data = {
        "id": contract.id,
        "title": contract.title,
        "filename": contract.filename,
        "upload_type": contract.upload_type,
        "status": contract.status,
        "file_size": contract.file_size,
        "created_at": contract.created_at,
        "updated_at": contract.updated_at,
        "content_text": contract.content_text,
        "analysis": None,
    }
    if contract.analysis:
        a = contract.analysis
        data["analysis"] = AnalysisResponse(
            id=a.id,
            contract_id=a.contract_id,
            overall_risk_score=a.overall_risk_score,
            overall_risk_level=a.overall_risk_level,
            summary=a.summary,
            contract_type=a.contract_type,
            key_dates=a.key_dates,
            parties=a.parties,
            clauses=[ClauseAnalysis(**c) for c in (a.clauses or [])],
            suggestions=a.suggestions or [],
            created_at=a.created_at,
            analysis_duration_ms=a.analysis_duration_ms,
        )
    return data


@router.post("/upload/text", response_model=ContractResponse, status_code=201)
def upload_text(
    body: ContractUploadText,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not body.title or not body.title.strip():
        raise HTTPException(status_code=422, detail="Title is required")
    if not body.content or not body.content.strip():
        raise HTTPException(status_code=422, detail="Contract content is required")
    if len(body.content) < 50:
        raise HTTPException(
            status_code=422,
            detail="Contract text is too short. Please provide the full contract.",
        )

    contract = contract_service.create_contract_from_text(
        db, current_user.id, body.title.strip(), body.content.strip()
    )
    return ContractResponse.model_validate(contract)


@router.post("/upload/pdf", response_model=ContractResponse, status_code=201)
def upload_pdf(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files are accepted")

    try:
        contract = contract_service.create_contract_from_pdf(
            db, current_user.id, title.strip(), file
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return ContractResponse.model_validate(contract)


@router.get("/", response_model=list[ContractResponse])
def list_contracts(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contracts = contract_service.get_user_contracts(db, current_user.id, skip, limit)
    return [ContractResponse.model_validate(c) for c in contracts]


@router.get("/{contract_id}", response_model=ContractDetailResponse)
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = contract_service.get_contract(db, contract_id, current_user.id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return _build_detail_response(contract)


@router.post("/{contract_id}/analyze", response_model=AnalysisResponse)
def trigger_analysis(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        analysis = contract_service.analyze_contract(
            db, contract_id, current_user.id, ai_service
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ContractAnalysisError as e:
        status_code = 503 if e.recoverable else 500
        raise HTTPException(status_code=status_code, detail=e.message)

    return AnalysisResponse(
        id=analysis.id,
        contract_id=analysis.contract_id,
        overall_risk_score=analysis.overall_risk_score,
        overall_risk_level=analysis.overall_risk_level,
        summary=analysis.summary,
        contract_type=analysis.contract_type,
        key_dates=analysis.key_dates,
        parties=analysis.parties,
        clauses=[ClauseAnalysis(**c) for c in (analysis.clauses or [])],
        suggestions=analysis.suggestions or [],
        created_at=analysis.created_at,
        analysis_duration_ms=analysis.analysis_duration_ms,
    )


@router.delete("/{contract_id}", status_code=204)
def delete_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = contract_service.delete_contract(db, contract_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Contract not found")
