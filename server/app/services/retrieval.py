from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document_chunk import DocumentChunk
from app.services.embeddings import generate_embedding


def retrieve_chunks(
    db: Session,
    document_id: int,
    question: str,
    top_k: int = 5,
) -> list[DocumentChunk]:
    """
    Retrieve the most relevant chunks from one document.

    Retrieval is ALWAYS restricted by document_id.
    """

    if not question.strip():
        return []

    if top_k <= 0:
        raise ValueError("top_k must be greater than 0")

    query_embedding = generate_embedding(question)

    statement = (
        select(DocumentChunk)
        .where(
            DocumentChunk.document_id == document_id
        )
        .order_by(
            DocumentChunk.embedding.cosine_distance(
                query_embedding
            )
        )
        .limit(top_k)
    )

    result = db.execute(statement)

    return list(result.scalars().all())
