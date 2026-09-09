import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.services.chunking import create_document_chunks
from app.services.embeddings import generate_embedding
from app.services.pdf import extract_text_from_pdf


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF and store its chunks + embeddings.
    """

    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed.",
        )

    # Validate filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="A valid filename is required.",
        )

    # Create a safe file path
    file_path = UPLOAD_DIR / file.filename

    try:
        # Save uploaded file
        file_size = 0

        with open(file_path, "wb") as buffer:
            while True:
                chunk = file.file.read(1024 * 1024)

                if not chunk:
                    break

                file_size += len(chunk)

                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="PDF file is too large. Maximum size is 10 MB.",
                    )

                buffer.write(chunk)

        # Extract PDF text
        pages = extract_text_from_pdf(
            str(file_path)
        )

        if not pages:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the PDF.",
            )

        # Create document record
        document = Document(
            filename=file.filename,
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        # Create chunks while preserving page numbers
        chunks = create_document_chunks(pages)

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No text chunks could be created from the PDF.",
            )

        # Generate embeddings and store chunks
        for chunk in chunks:
            embedding = generate_embedding(
                chunk["content"]
            )

            document_chunk = DocumentChunk(
                document_id=document.id,
                page_number=chunk["page_number"],
                chunk_index=chunk["chunk_index"],
                content=chunk["content"],
                embedding=embedding,
            )

            db.add(document_chunk)

        db.commit()

        return {
            "message": "PDF uploaded successfully.",
            "document_id": document.id,
            "filename": document.filename,
            "pages": len(pages),
            "chunks": len(chunks),
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to process the PDF.",
        ) from exc

    finally:
        # Remove temporary uploaded file
        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass
