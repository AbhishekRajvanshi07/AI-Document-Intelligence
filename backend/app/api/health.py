from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.4.1",
        "services": {"api": "up", "ocr": "up", "nlp": "up"},
    }
