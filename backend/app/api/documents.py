from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.services import document_service

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf", "image/png", "image/jpeg", "image/tiff",
    "image/bmp", "image/webp",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    lang: str = Form("eng"),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")
    result = await document_service.ingest_document(file, db, lang=lang)
    return result


@router.get("")
async def list_documents(
    doc_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    docs = await document_service.list_documents(db, doc_type, status, limit, offset)
    return {"total": len(docs), "limit": limit, "offset": offset, "items": docs}


@router.get("/{doc_id}")
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    doc = await document_service.get_document(doc_id, db)
    if not doc:
        raise HTTPException(404, f"Document {doc_id} not found")
    return doc


@router.get("/{doc_id}/export")
async def export_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    doc = await document_service.get_document(doc_id, db)
    if not doc:
        raise HTTPException(404, f"Document {doc_id} not found")
    return JSONResponse(
        content=doc,
        headers={"Content-Disposition": f'attachment; filename="{doc_id}.json"'},
    )


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    ok = await document_service.delete_document(doc_id, db)
    if not ok:
        raise HTTPException(404, f"Document {doc_id} not found")
    return {"deleted": doc_id}
