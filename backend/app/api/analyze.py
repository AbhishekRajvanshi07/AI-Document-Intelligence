from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64

from app.services.ocr_service import ocr_service
from app.services.nlp_service import nlp_service

router = APIRouter()


class OCRRequest(BaseModel):
    image_b64: str
    lang: str = "eng"


class NLPRequest(BaseModel):
    text: str


@router.post("/ocr")
async def run_ocr(req: OCRRequest):
    try:
        image_bytes = base64.b64decode(req.image_b64)
    except Exception:
        raise HTTPException(400, "Invalid base64 image data")
    return ocr_service.process_bytes(image_bytes, lang=req.lang)


@router.post("/nlp")
async def run_nlp(req: NLPRequest):
    result = nlp_service.extract(req.text)
    return {
        "classification": result.classification,
        "classification_confidence": result.classification_confidence,
        "fields": result.fields,
        "entities": [{"text": e.text, "label": e.label} for e in result.entities],
    }
