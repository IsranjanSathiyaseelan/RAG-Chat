from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.chat import ChatMessage
from app.models.document_chunk import DocumentChunk
from app.schemas.chat import ChatRequest
from app.services.llm import ask_llm
from app.services.retrieval import retrieve_chunks


router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"],
)


@router.post("")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    """
    Ask a question about a specific PDF document.
    """

    try:
        # Verify that the document contains chunks
        chunk_exists = (
            db.query(DocumentChunk.id)
            .filter(
                DocumentChunk.document_id
                == request.document_id
            )
            .first()
        )

        if not chunk_exists:
            raise HTTPException(
                status_code=404,
                detail="Document not found or has no processed content.",
            )

        # Retrieve relevant chunks
        chunks = retrieve_chunks(
            db=db,
            document_id=request.document_id,
            question=request.question,
            top_k=request.top_k,
        )

        # Generate answer using ONLY retrieved chunks
        result = ask_llm(
            question=request.question,
            chunks=chunks,
        )

        # References come from the chunks actually
        # retrieved and supplied to Gemini
        references = []

        for chunk in chunks:
            references.append(
                {
                    "chunk_id": chunk.id,
                    "page_number": chunk.page_number,
                    "source_text": chunk.content,
                }
            )

        # Persist conversation to database
        try:
            chat_record = ChatMessage(
                document_id=request.document_id,
                question=request.question,
                answer=result["answer"],
            )
            db.add(chat_record)
            db.commit()
        except Exception as db_err:
            db.rollback()
            print(f"Failed to persist chat message: {db_err}")

        return {
            "answer": result["answer"],
            "references": references,
            "usage": result["usage"],
        }

    except HTTPException:
        raise

    except Exception as exc:
        # Log the real error on the server in production.
        print(f"Chat error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Unable to generate an answer at this time.",
        ) from exc


@router.get("/{document_id}")
def get_chat_history(
    document_id: int,
    db: Session = Depends(get_db),
):
    """
    Get all previous chat messages for a specific document.
    """
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.document_id == document_id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .all()
    )

    return [
        {
            "id": message.id,
            "document_id": message.document_id,
            "question": message.question,
            "answer": message.answer,
            "created_at": message.created_at.isoformat() if message.created_at else None,
        }
        for message in messages
    ]

