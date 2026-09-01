from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from backend.schemas.analysis import AnalysisResponse


class ContractUploadText(BaseModel):
    title: str
    content: str


class ContractResponse(BaseModel):
    id: int
    title: str
    filename: Optional[str] = None
    upload_type: str
    status: str
    file_size: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ContractDetailResponse(ContractResponse):
    content_text: str
    analysis: Optional[AnalysisResponse] = None
