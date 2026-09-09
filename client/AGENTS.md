AGENTS.md
Project Overview

This project is a full-stack PDF RAG Chat application built with Next.js and FastAPI.

The application allows users to:

Upload a PDF document.
Extract text from the PDF.
Split the text into chunks.
Generate embeddings for the chunks.
Store the chunks and embeddings in PostgreSQL with pgvector.
Ask questions about the uploaded PDF.
Retrieve relevant information from the PDF.
Generate answers using only the uploaded PDF content.
Display references with page numbers and relevant source text.
Application Flow
PDF Upload
↓
PDF Text Extraction
↓
Text Chunking
↓
Generate Embeddings
↓
PostgreSQL + pgvector
↓
User Question
↓
Vector Search
↓
Relevant PDF Chunks
↓
LLM
↓
Answer + References

Technology Stack
Frontend: Next.js, React, TypeScript, Tailwind CSS
Backend: Python, FastAPI, Uvicorn
Database: PostgreSQL + pgvector
PDF Processing: PyMuPDF
AI: OpenAI Embeddings + OpenAI LLM
Rules

1. PDF-Only Answers

The AI must answer questions using only information retrieved from the uploaded PDF.

Do not use external knowledge to answer document questions.

If the information is not available in the PDF, respond with:

I couldn't find that information in the uploaded document.

Never invent or hallucinate information.

2. Document Isolation

Retrieval must always be restricted to the selected document.

Every vector search must use:

document_id = current_document_id

Never retrieve chunks from unrelated documents.

When authentication is added, retrieval must also be restricted by:

user_id + document_id

3. Preserve Page Numbers

Every extracted PDF chunk must keep its original page number.

Each chunk should contain:

document_id
page_number
chunk_index
content
embedding

Page information must never be removed because it is required for references.

4. References Are Required

The system should provide references for generated answers whenever relevant sources are available.

Each reference should include:

Page number
Source text
Chunk ID

Example:

Answer:
The study used a qualitative research methodology.

References:

Page 7
"The researchers conducted semi-structured interviews..."

Page 8
"Interview transcripts were analyzed..."

5. Grounded Generation

The LLM must receive the retrieved PDF content as context.

The system prompt should clearly instruct the LLM:

Answer only using the provided document context.
Do not use outside knowledge.
If the answer is not present in the context,
say that the information could not be found
in the uploaded document.

6. Security
   Never expose API keys to the frontend.
   Keep OpenAI API keys on the FastAPI server.
   Never commit .env files.
   Validate uploaded PDF files.
   Limit file upload size.
   Verify document ownership when authentication is implemented.
   Never expose sensitive server errors to users.
7. Code Organization

Keep API routes separate from business logic.

Use:

api/
→ API endpoints

services/
→ RAG, PDF, embedding, retrieval and LLM logic

models/
→ Database models

schemas/
→ Request and response schemas

db/
→ Database configuration

Do not put the entire application inside main.py.

8. Backend Rules
   Use FastAPI for the API.
   Use Uvicorn to run the server.
   Use Pydantic for request/response validation.
   Use SQLAlchemy for database interaction.
   Use PostgreSQL + pgvector for vector storage.
   Use Alembic for database migrations.
9. Frontend Rules
   Use Next.js with TypeScript.
   Keep API communication in a dedicated API module.
   Do not expose backend secrets.
   Show loading and error states.
   Display answers and references clearly.
   Keep UI components separate from business logic.
10. Simplicity

Do not over-engineer the MVP.

The initial architecture should remain:

Next.js
↓
FastAPI
↓
PostgreSQL + pgvector
↓
OpenAI

Do not add unnecessary technologies such as Kafka, Kubernetes, microservices, or multiple databases unless there is a clear requirement.

11. Code Quality
    Write clean and readable code.
    Use meaningful names.
    Use Python type hints.
    Use TypeScript types.
    Avoid unnecessary abstractions.
    Avoid duplicated code.
    Keep functions focused and reasonably small.

12. Agent Rules

When modifying the project:

Inspect the existing code before making changes.
Do not overwrite working code unnecessarily.
Follow the existing project structure.
Follow the rules in this file.
Preserve PDF page metadata.
Never fabricate answers.
Always scope retrieval to the selected document.
Keep secrets out of source code.
Do not introduce unnecessary dependencies.
Explain significant architectural changes.
Keep the implementation simple and maintainable.
