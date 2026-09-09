from pydantic import BaseModel


class ChatRequest(BaseModel):
    document_id: int
    question: str
    top_k: int = 5