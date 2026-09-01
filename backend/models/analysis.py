from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import JSON

from backend.core.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    contract_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("contracts.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    overall_risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    overall_risk_level: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # low | medium | high | critical
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    contract_type: Mapped[str] = mapped_column(String(100), nullable=False)
    key_dates: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    parties: Mapped[list | None] = mapped_column(JSON, nullable=True)
    clauses: Mapped[list] = mapped_column(JSON, nullable=False)
    suggestions: Mapped[list] = mapped_column(JSON, nullable=False)
    raw_ai_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    analysis_duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    contract = relationship("Contract", back_populates="analysis")
