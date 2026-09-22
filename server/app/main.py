import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.api import chat, documents
from app.db.database import Base, engine
from app.models import (
    Document,
    DocumentChunk,
    ChatMessage,
)  # noqa: F401 — registers tables with Base.metadata
from app.services.llm import ask_llm


# --------------------------------------------------
# Database
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# FastAPI Application
# --------------------------------------------------

app = FastAPI(
    title="PDF RAG Chat API",
    description="RAG API for asking questions about uploaded PDF documents",
    version="1.0.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API Routers
# --------------------------------------------------

app.include_router(documents.router)
app.include_router(chat.router)


# --------------------------------------------------
# Request Schemas
# --------------------------------------------------

class LLMRequest(BaseModel):
    question: str


# --------------------------------------------------
# Routes
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "PDF RAG Chat API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post("/api/test-llm")
def test_llm(request: LLMRequest):
    answer = ask_llm(request.question)

    return {
        "answer": answer
    }