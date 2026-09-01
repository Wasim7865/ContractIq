from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ClauseAnalysis(BaseModel):
    clause_title: str
    clause_text: str
    risk_level: str  # low | medium | high | critical
    risk_score: float
    explanation: str
    original_text: str = ""


class AnalysisResponse(BaseModel):
    id: int
    contract_id: int
    overall_risk_score: float
    overall_risk_level: str
    summary: str
    contract_type: str
    key_dates: Optional[dict[str, Any]] = None
    parties: Optional[list[str]] = None
    clauses: list[ClauseAnalysis]
    suggestions: list[str]
    created_at: datetime
    analysis_duration_ms: Optional[int] = None

    model_config = {"from_attributes": True}
