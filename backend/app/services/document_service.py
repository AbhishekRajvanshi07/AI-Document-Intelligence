"""
Document orchestrator — reads bytes, calls OCR+NLP, stores in R2 + Neon
"""
import uuid
import logging
from datetime import datetime
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.storage import upload_file_to_r2, get_presigned_url, delete_from_r2
from app.services.ocr_service import ocr_service
from app.services.nlp_service import nlp_service
from app.models.document import Document

logger = logging.getLogger(__name__)

ALLOWED_TYPES = {
    "application/pdf",
    "image/png", "image/jpeg", "image/tiff", "image/bmp", "image/webp",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _ext_to_type(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return {"pdf": "pdf", "png": "image", "jpg": "image", "jpeg": "image",
            "tiff": "image", "tif": "image", "bmp": "image", "webp": "image",
            "docx": "docx", "doc": "docx"}.get(ext, "unknown")


async def ingest_document(file: UploadFile, db: AsyncSession, lang: str = "eng") -> dict:
    doc_id = str(uuid.uuid4())
    file_bytes = await file.read()
    safe_name = (file.filename or "upload").replace(" ", "_")
    mime = file.content_type or "application/octet-stream"
    doc_type = _ext_to_type(safe_name)

    # 1. Upload raw file to Cloudflare R2
    r2_key = f"documents/{doc_id}/{safe_name}"
    upload_file_to_r2(file_bytes, r2_key, mime)

    # 2. OCR (PDF + images only)
    ocr_result = {"text": "", "confidence": 0.0, "processing_ms": 0}
    if doc_type in ("pdf", "image"):
        ocr_result = ocr_service.process_bytes(file_bytes, lang=lang)

    # 3. NLP extraction
    nlp_result = nlp_service.extract(ocr_result["text"])

    # 4. Persist to Neon PostgreSQL
    doc = Document(
        id=doc_id,
        filename=safe_name,
        original_name=file.filename or safe_name,
        r2_key=r2_key,
        file_size=len(file_bytes),
        mime_type=mime,
        doc_type=doc_type,
        status="completed",
        classification=nlp_result.classification,
        confidence=nlp_result.classification_confidence,
        fields_extracted=len(nlp_result.fields),
        extracted_data=nlp_result.fields,
        nlp_entities=[{"text": e.text, "label": e.label} for e in nlp_result.entities],
        raw_ocr_text=ocr_result["text"],
        processing_ms=ocr_result["processing_ms"],
        processed_at=datetime.utcnow(),
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return _doc_to_dict(doc)


async def list_documents(db: AsyncSession, doc_type=None, status=None, limit=20, offset=0):
    q = select(Document).order_by(Document.created_at.desc())
    if doc_type:
        q = q.where(Document.doc_type == doc_type)
    if status:
        q = q.where(Document.status == status)
    q = q.limit(limit).offset(offset)
    result = await db.execute(q)
    docs = result.scalars().all()
    return [_doc_to_dict(d) for d in docs]


async def get_document(doc_id: str, db: AsyncSession):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        return None
    data = _doc_to_dict(doc)
    if doc.r2_key:
        data["download_url"] = get_presigned_url(doc.r2_key)
    return data


async def delete_document(doc_id: str, db: AsyncSession) -> bool:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        return False
    if doc.r2_key:
        delete_from_r2(doc.r2_key)
    await db.delete(doc)
    await db.commit()
    return True


def _doc_to_dict(doc: Document) -> dict:
    return {
        "id": doc.id,
        "filename": doc.filename,
        "original_name": doc.original_name,
        "r2_key": doc.r2_key,
        "file_size": doc.file_size,
        "mime_type": doc.mime_type,
        "doc_type": doc.doc_type,
        "status": doc.status,
        "classification": doc.classification,
        "confidence": doc.confidence,
        "fields_extracted": doc.fields_extracted,
        "extracted_data": doc.extracted_data,
        "nlp_entities": doc.nlp_entities,
        "raw_ocr_text": doc.raw_ocr_text,
        "processing_ms": doc.processing_ms,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "processed_at": doc.processed_at.isoformat() if doc.processed_at else None,
    }
