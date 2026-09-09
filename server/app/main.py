from fastapi import FastAPI
from pydantic import BaseModel

from app.services.llm import ask_llm

app = FastAPI(
    title="PDF RAG Chat API",
    description="RAG API for asking questions about uploaded PDF documents",
    version="1.0.0",
)


class LLMRequest(BaseModel):
    question: str


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
