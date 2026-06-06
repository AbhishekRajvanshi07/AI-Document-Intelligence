import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    # R2 object key instead of local path
    r2_key: Mapped[str] = mapped_column(String(500), nullable=True)
    file_size: Mapped[int] = mapped_column(Integer, default=0)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=True)
    doc_type: Mapped[str] = mapped_column(String(50), default="unknown")
    status: Mapped[str] = mapped_column(String(50), default="queued")
    classification: Mapped[str] = mapped_column(String(100), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    fields_extracted: Mapped[int] = mapped_column(Integer, default=0)
    extracted_data: Mapped[dict] = mapped_column(JSON, nullable=True)
    nlp_entities: Mapped[dict] = mapped_column(JSON, nullable=True)
    raw_ocr_text: Mapped[str] = mapped_column(String, nullable=True)
    processing_ms: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
