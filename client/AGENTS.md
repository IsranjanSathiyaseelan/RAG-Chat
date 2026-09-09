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
Groq LLM
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
Database
PostgreSQL
pgvector
SQLAlchemy
Alembic
PDF Processing
PyMuPDF
AI
Groq API for LLM generation
Embedding model/provider for vector embeddings
pgvector for vector similarity search
Rules
1. PDF-Only Answers

The AI must answer document questions using only information retrieved from the uploaded PDF.

Do not use external knowledge to answer document questions.

If the information is not available in the retrieved document context, respond with:

I couldn't find that information in the uploaded document.


Never invent, guess, or hallucinate information.

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


References must come from the chunks actually used for generating the answer.

Do not create or fabricate references.

5. Grounded Generation

The Groq LLM must receive the retrieved PDF content as context.

The system prompt must clearly instruct the LLM:

Answer only using the provided document context.

Do not use outside knowledge.

If the answer is not present in the provided context,
say:

"I couldn't find that information in the uploaded document."

Do not invent or assume information.

Use the provided sources to support the answer.


The retrieved PDF context is the source of truth.

6. Groq API

Use the Groq API for LLM generation.

Groq API calls must be made from the FastAPI backend.

The Groq API key must never be exposed to the Next.js frontend.

Use an environment variable:

GROQ_API_KEY=


Never hard-code the API key.

Keep Groq-specific implementation inside the service layer.

For example:

services/
└── llm.py


or:

services/
├── embeddings.py
└── llm.py


The LLM service should be responsible for communicating with Groq.

Example:

from groq import Groq
import os

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


Do not initialize or call the Groq API directly from API route files.

7. Embeddings

Groq is used for LLM generation.

Embeddings should use a dedicated embedding model/provider that supports generating vector embeddings.

The embedding provider must be kept separate from the Groq LLM service.

For example:

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

8. Token Usage

The application must track token usage for Groq LLM requests whenever usage information is provided by the API.

At minimum, track:

input_tokens
output_tokens
total_tokens


Example:

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


Do not estimate token usage when actual usage information is available from Groq.

Embedding usage should also be tracked when the selected embedding provider provides usage information.

9. Token Efficiency

Do not send the entire PDF to the LLM for every question.

Use the RAG pipeline:

User Question
    ↓
Question Embedding
    ↓
Vector Search
    ↓
Relevant Chunks
    ↓
Groq LLM


Only relevant retrieved chunks should be included in the LLM context.

The number of retrieved chunks should be configurable.

Avoid unnecessarily large prompts.

10. Cost Tracking

If cost tracking is implemented, keep token usage separate from cost calculation.

Do not hard-code AI pricing throughout the application.

Pricing should be configurable.

Any calculated cost should be clearly labeled as an estimate unless it comes directly from an authoritative billing source.

11. Security

Never expose GROQ_API_KEY to the frontend.

Keep API keys on the FastAPI server.

Never commit .env files.

Validate uploaded PDF files.

Limit PDF file size.

Verify document ownership when authentication is implemented.

Never expose sensitive server errors to users.

Never expose internal credentials.

Do not expose unnecessary internal system prompts or configuration.

Restrict retrieval to the authorized document.

12. Code Organization

Keep API routes separate from business logic.

Use:

api/
    → API endpoints

services/
    → PDF, chunking, embeddings, retrieval and LLM logic

models/
    → Database models

schemas/
    → Request and response schemas

db/
    → Database configuration


Do not put the entire application inside main.py.

main.py should primarily configure FastAPI and register routes.

13. Backend Rules

Use FastAPI for the API.

Use Uvicorn to run the server.

Use Pydantic for request/response validation.

Use SQLAlchemy for database interaction.

Use PostgreSQL + pgvector for vector storage.

Use Alembic for database migrations.

Use PyMuPDF for PDF text extraction.

Use Groq API for LLM generation.

Use a dedicated embedding provider/model for embeddings.

Keep AI provider logic inside service modules.

Track actual Groq token usage when available.

Return references with generated answers.

Always scope vector retrieval to the selected document_id.

14. Frontend Rules

Use Next.js with TypeScript.

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

15. Database Rules

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

16. RAG Context Construction

Retrieved chunks should be converted into a structured context before being sent to Groq.

Example:

Document Context:

[Chunk ID: 12 | Page 7]
The researchers conducted semi-structured interviews...

[Chunk ID: 13 | Page 8]
Interview transcripts were analyzed...


The LLM should be instructed to use this context as the only source of information.

The application should preserve the relationship between:

LLM answer
    ↓
Retrieved chunks
    ↓
Document page numbers


This allows references to be returned reliably.

17. API Response Structure

The question-answer endpoint should return enough information for the frontend to display the answer, references, and token usage.

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

References must correspond to chunks actually retrieved and supplied to the LLM.

18. Error Handling

Do not expose raw provider errors to the frontend.

For example, do not return:

groq.AuthenticationError


or:

Traceback ...


Instead, return a safe API error such as:

{
  "detail": "Unable to generate an answer at this time."
}


Log detailed errors on the backend for debugging.

19. Simplicity

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
Groq API


Do not add unnecessary technologies such as:

Kafka
Kubernetes
Microservices
Multiple databases
Redis
Complex agent frameworks

unless there is a clear requirement.

20. Code Quality

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

21. Agent Rules

When modifying the project:

Inspect the existing code before making changes.
Do not overwrite working code unnecessarily.
Follow the existing project structure.
Follow the rules in this file.
Preserve PDF page metadata.
Never fabricate answers.
Always scope retrieval to the selected document.
Keep Groq API keys out of source code.
Use environment variables for secrets.
Track actual Groq token usage when available.
Do not send the entire PDF to Groq unnecessarily.
Use only retrieved PDF content for document questions.
Do not introduce unnecessary dependencies.
Do not introduce unnecessary architecture.
Explain significant architectural changes.
Keep the implementation simple and maintainable.
Ensure generated answers can be traced back to PDF references.
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
          PyMuPDF       PostgreSQL      Groq API
              │          + pgvector
              │              ▲
              ▼              │
          Chunking ──► Embeddings

Core principle
The PDF is the source of truth.

Retrieve relevant PDF chunks first.

Then send only those chunks to Groq.

Groq must answer using only the retrieved PDF context.

Every answer should be traceable to the retrieved
chunks and their original page numbers.