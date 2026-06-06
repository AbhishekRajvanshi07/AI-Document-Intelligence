"""
AI Document Intelligence Platform — FastAPI entry point
Cloud stack: Neon (PostgreSQL) + Upstash (Redis) + Cloudflare R2 (storage) + Render (hosting)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from app.api import documents, analyze, health
from app.core.config import settings
from app.core.database import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Document Intelligence Platform...")
    await init_db()
    logger.info("Database ready")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="AI Document Intelligence API",
    description="Extract structured data from PDFs and images — Neon + R2 + Upstash",
    version="2.4.1",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["Analyze"])


@app.get("/")
async def root():
    return {"name": "AI Document Intelligence Platform", "version": "2.4.1", "docs": "/docs"}
