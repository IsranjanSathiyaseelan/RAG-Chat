AGENTS.md
Project Overview

This project is a full-stack PDF RAG Chat application built with Next.js and FastAPI.

The application allows users to:

Upload a PDF document.
Extract text from the PDF.
Split the text into chunks.
Generate embeddings for the chunks.
Store chunks and embeddings in PostgreSQL with pgvector.
Ask questions about the uploaded PDF.
Retrieve relevant information from the uploaded PDF.
Generate answers using only the uploaded PDF content.
Display references with page numbers and relevant source text.
Display token usage for AI requests.
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
Question Embedding
    ↓
Vector Search
    ↓
Relevant PDF Chunks
    ↓
Gemini LLM
    ↓
Answer + References + Token Usage

Technology Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Backend
Python
FastAPI
Uvicorn
Pydantic
SQLAlchemy
Database
PostgreSQL
pgvector
Alembic
PDF Processing
PyMuPDF
AI
Google Gemini API / Gemini AI Studio
Gemini LLM for answer generation
Dedicated embedding model/provider for vector embeddings
pgvector for vector similarity search
Rules
1. PDF-Only Answers

The AI must answer document questions using only information retrieved from the uploaded PDF.

Do not use external knowledge to answer document questions.

If the information is not available in the retrieved document context, respond with:

I couldn't find that information in the uploaded document.


Never invent, guess, or hallucinate information.

The retrieved PDF context is the source of truth.

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


References must come from chunks actually retrieved and supplied to Gemini.

Do not create or fabricate references.

5. Grounded Generation

Gemini must receive the retrieved PDF content as context.

The system prompt must clearly instruct Gemini:

Answer only using the provided document context.

Do not use outside knowledge.

If the answer is not present in the provided context,
say:

"I couldn't find that information in the uploaded document."

Do not invent or assume information.

Use the provided sources to support the answer.

The provided document context is the only source of truth.


The application must construct the Gemini prompt using only retrieved PDF chunks.

6. Gemini API

Use the Google Gemini API through Gemini AI Studio for LLM generation.

Gemini API calls must be made from the FastAPI backend.

The Gemini API key must never be exposed to the Next.js frontend.

Use an environment variable:

GEMINI_API_KEY=


Never hard-code the API key.

Keep Gemini-specific implementation inside the service layer.

Recommended structure:

services/
└── llm.py


or:

services/
├── embeddings.py
└── llm.py


The LLM service is responsible for communicating with Gemini.

Example:

import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


Gemini-specific code must not be placed directly inside API route files.

7. Embeddings

Gemini LLM generation and embeddings should be treated as separate responsibilities.

The embedding provider/model must be kept separate from the LLM service.

Recommended structure:

services/
├── embeddings.py
└── llm.py


The embedding service should provide functionality for:

PDF chunk
    ↓
Embedding model
    ↓
Vector
    ↓
pgvector


The same embedding model must be used when:

Creating document chunk embeddings.
Creating the user's question embedding.

Do not mix embedding models between indexing and querying.

If Gemini embeddings are used, use the same Gemini embedding model for both document chunks and question embeddings.

8. Token Usage

The application must track token usage for Gemini LLM requests whenever usage information is provided by the API.

At minimum, track:

input_tokens
output_tokens
total_tokens


Example response:

{
  "usage": {
    "input_tokens": 1250,
    "output_tokens": 180,
    "total_tokens": 1430
  }
}


The frontend should display token usage clearly:

Token Usage

Input: 1,250
Output: 180
Total: 1,430


Do not estimate token usage when actual usage information is available from Gemini.

Embedding usage should also be tracked when the selected embedding provider provides usage information.

9. Token Efficiency

Do not send the entire PDF to Gemini for every question.

Use the RAG pipeline:

User Question
    ↓
Question Embedding
    ↓
Vector Search
    ↓
Relevant Chunks
    ↓
Gemini LLM


Only relevant retrieved chunks should be included in the Gemini context.

The number of retrieved chunks should be configurable.

Avoid unnecessarily large prompts.

10. Cost Tracking

If cost tracking is implemented, keep token usage separate from cost calculation.

Do not hard-code Gemini pricing throughout the application.

Pricing should be configurable.

Any calculated cost should be clearly labeled as an estimate unless it comes directly from an authoritative billing source.

11. Security

Never expose:

GEMINI_API_KEY


to the frontend.

Keep API keys on the FastAPI server.

Never commit .env files.

Validate uploaded PDF files.

Limit PDF file size.

Verify document ownership when authentication is implemented.

Never expose sensitive server errors to users.

Never expose internal credentials.

Do not expose unnecessary internal system prompts or configuration.

Restrict retrieval to the authorized document.

Code Organization

Keep API routes separate from business logic.

Recommended structure:

app/
├── api/
│   └── ...
│
├── services/
│   ├── pdf.py
│   ├── chunking.py
│   ├── embeddings.py
│   ├── retrieval.py
│   └── llm.py
│
├── models/
│   └── ...
│
├── schemas/
│   └── ...
│
├── db/
│   └── ...
│
└── main.py

Responsibilities
api/

API endpoints and request handling.

services/

Business logic including:

PDF processing
Text extraction
Chunking
Embeddings
Retrieval
Gemini communication
RAG context construction
models/

SQLAlchemy database models.

schemas/

Pydantic request and response schemas.

db/

Database configuration and session management.

main.py

FastAPI application configuration and route registration.

Do not put the entire application inside main.py.

Backend Rules

Use:

FastAPI for the API.
Uvicorn to run the server.
Pydantic for request/response validation.
SQLAlchemy for database interaction.
PostgreSQL + pgvector for vector storage.
Alembic for database migrations.
PyMuPDF for PDF processing.
Gemini API for LLM generation.
A dedicated embedding provider/model for embeddings.

Keep AI provider logic inside service modules.

Track actual Gemini token usage when available.

Return references with generated answers.

Always scope vector retrieval to the selected document_id.

Frontend Rules

Use:

Next.js
TypeScript
React
Tailwind CSS

Keep API communication in a dedicated API module.

Do not expose backend secrets.

Show loading states.

Show error states.

Display answers clearly.

Display PDF references clearly.

Display page numbers for references.

Display source excerpts.

Display token usage.

Keep UI components separate from business logic.

Example:

Answer

The study used a qualitative methodology.

References
──────────

Page 7
The researchers conducted semi-structured interviews...

Page 8
Interview transcripts were analyzed...

Token Usage
──────────

Input: 1,250 tokens
Output: 180 tokens
Total: 1,430 tokens

Database Rules

Use:

PostgreSQL + pgvector


Documents and chunks must be associated.

Conceptually:

documents
    ↓
document_chunks


Each chunk must contain:

document_id
page_number
chunk_index
content
embedding


Vector searches must always filter by:

document_id


Example conceptual query:

SELECT *
FROM document_chunks
WHERE document_id = :document_id
ORDER BY embedding <=> :query_embedding
LIMIT :top_k;


Never perform an unrestricted vector search across all documents.

RAG Context Construction

Retrieved chunks should be converted into a structured context before being sent to Gemini.

Example:

Document Context:

[Chunk ID: 12 | Page 7]
The researchers conducted semi-structured interviews...

[Chunk ID: 13 | Page 8]
Interview transcripts were analyzed...


Gemini should be instructed to use this context as the only source of information.

The application must preserve the relationship:

Gemini Answer
     ↓
Retrieved Chunks
     ↓
Document Page Numbers


This allows references to be returned reliably.

API Response Structure

The question-answer endpoint should return enough information for the frontend to display:

Answer
References
Token usage

Conceptually:

{
  "answer": "The study used a qualitative methodology.",
  "references": [
    {
      "chunk_id": 12,
      "page_number": 7,
      "source_text": "The researchers conducted semi-structured interviews..."
    },
    {
      "chunk_id": 13,
      "page_number": 8,
      "source_text": "Interview transcripts were analyzed..."
    }
  ],
  "usage": {
    "input_tokens": 1250,
    "output_tokens": 180,
    "total_tokens": 1430
  }
}


Do not fabricate reference information.

References must correspond to chunks actually retrieved and supplied to Gemini.

Error Handling

Do not expose raw Gemini/provider errors to the frontend.

Do not return:

google.api_core.exceptions...


or:

Traceback ...


Instead, return a safe API error such as:

{
  "detail": "Unable to generate an answer at this time."
}


Detailed errors should be logged on the backend for debugging.

Never expose:

API keys
Internal prompts
Stack traces
Provider credentials
Sensitive configuration
Simplicity

Do not over-engineer the MVP.

The initial architecture should remain:

Next.js
   ↓
FastAPI
   ↓
PostgreSQL + pgvector
   ↓
Embedding Provider
   ↓
Gemini API


Do not add unnecessary technologies such as:

Kafka
Kubernetes
Microservices
Multiple databases
Redis
Complex agent frameworks

unless there is a clear requirement.

Code Quality

Write clean and readable code.

Use meaningful names.

Use Python type hints.

Use TypeScript types.

Avoid unnecessary abstractions.

Avoid duplicated code.

Keep functions focused and reasonably small.

Do not hard-code API keys.

Do not hard-code AI pricing.

Add tests for important functionality.

Keep provider-specific code inside service modules.

Keep API routes thin.

Keep business logic inside services.

Agent Rules

When modifying the project:

Inspect the existing code before making changes.
Do not overwrite working code unnecessarily.
Follow the existing project structure.
Follow the rules in this file.
Preserve PDF page metadata.
Never fabricate answers.
Always scope retrieval to the selected document_id.
Keep Gemini API keys out of source code.
Use environment variables for secrets.
Track actual Gemini token usage when available.
Do not send the entire PDF to Gemini unnecessarily.
Use only retrieved PDF content for document questions.
Do not introduce unnecessary dependencies.
Do not introduce unnecessary architecture.
Explain significant architectural changes.
Keep the implementation simple and maintainable.
Ensure generated answers can be traced back to PDF references.
Keep Gemini-specific implementation inside service modules.
Use the same embedding model for indexing and querying.
Never perform vector retrieval without document_id filtering.
Final Architecture

The target MVP architecture is:

                    ┌──────────────────┐
                    │    Next.js UI    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     FastAPI      │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        PDF Processing   Retrieval      LLM Service
              │              │              │
              ▼              ▼              ▼
          PyMuPDF       PostgreSQL      Gemini API
              │          + pgvector
              │              ▲
              ▼              │
          Chunking ──► Embeddings

Core Principle

The PDF is the source of truth.

Retrieve relevant PDF chunks first.

Then send only those chunks to Gemini.

Gemini must answer using only the retrieved PDF context.

Every answer should be traceable to the retrieved chunks and their original page numbers.

The Gemini API key must remain on the FastAPI backend and must never be exposed to the frontend.