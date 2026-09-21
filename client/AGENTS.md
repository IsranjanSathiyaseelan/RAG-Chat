# AGENTS.md — RAG-Chat Project Guide

> This document defines the architecture, rules, and agent behaviour for the **RAG-Chat** project.  
> All contributors and AI agents **must** follow every rule in this file.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Application Flow](#application-flow)
- [Technology Stack](#technology-stack)
- [Core Rules](#core-rules)
  - [1. PDF-Only Answers](#1-pdf-only-answers)
  - [2. Document Isolation](#2-document-isolation)
  - [3. Preserve Page Numbers](#3-preserve-page-numbers)
  - [4. References Are Required](#4-references-are-required)
  - [5. Grounded Generation](#5-grounded-generation)
  - [6. Gemini API](#6-gemini-api)
  - [7. Embeddings](#7-embeddings)
  - [8. Token Usage](#8-token-usage)
  - [9. Token Efficiency](#9-token-efficiency)
  - [10. Cost Tracking](#10-cost-tracking)
  - [11. Security](#11-security)
- [Code Organisation](#code-organisation)
- [Backend Rules](#backend-rules)
- [Frontend Rules](#frontend-rules)
- [Database Rules](#database-rules)
- [RAG Context Construction](#rag-context-construction)
- [API Response Structure](#api-response-structure)
- [Error Handling](#error-handling)
- [Simplicity](#simplicity)
- [Code Quality](#code-quality)
- [Agent Rules](#agent-rules)
- [Final Architecture](#final-architecture)
- [Core Principle](#core-principle)

---

## Project Overview

This project is a full-stack **PDF RAG Chat** application built with **Next.js** and **FastAPI**.

The application allows users to:

- Upload a PDF document
- Extract text from the PDF
- Split the text into chunks
- Generate embeddings for the chunks
- Store chunks and embeddings in PostgreSQL with pgvector
- Ask questions about the uploaded PDF
- Retrieve relevant information from the uploaded PDF
- Generate answers using **only** the uploaded PDF content
- Display references with page numbers and relevant source text
- Display token usage for AI requests

---

## Application Flow

```
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
```

---

## Technology Stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js |
| UI | React |
| Language | TypeScript |
| Styling | Tailwind CSS |

### Backend

| Layer | Technology |
|---|---|
| API | FastAPI |
| Server | Uvicorn |
| Validation | Pydantic |
| ORM | SQLAlchemy |

### Database

| Layer | Technology |
|---|---|
| Database | PostgreSQL |
| Vector Search | pgvector |
| Migrations | Alembic |

### AI & PDF

| Layer | Technology |
|---|---|
| PDF Processing | PyMuPDF |
| LLM Generation | Google Gemini API / Gemini AI Studio |
| Embeddings | Dedicated Gemini embedding model |
| Vector Similarity | pgvector |

---

## Core Rules

### 1. PDF-Only Answers

- The AI **must** answer document questions using **only** information retrieved from the uploaded PDF.
- Do **not** use external knowledge to answer document questions.
- If the information is not available in the retrieved document context, respond with:

  > *"I couldn't find that information in the uploaded document."*

- **Never** invent, guess, or hallucinate information.
- The retrieved PDF context is the **source of truth**.

---

### 2. Document Isolation

- Retrieval must always be restricted to the **selected document**.
- Every vector search must filter by:

  ```sql
  document_id = current_document_id
  ```

- **Never** retrieve chunks from unrelated documents.
- When authentication is added, retrieval must also be restricted by `user_id + document_id`.

---

### 3. Preserve Page Numbers

Every extracted PDF chunk must keep its original page number. Each chunk must contain:

| Field | Description |
|---|---|
| `document_id` | Reference to the parent document |
| `page_number` | Original page in the PDF |
| `chunk_index` | Position of the chunk within the document |
| `content` | The extracted text |
| `embedding` | The vector representation |

> **Page information must never be removed** — it is required for references.

---

### 4. References Are Required

The system **must** provide references for generated answers whenever relevant sources are available.

Each reference must include:
- Page number
- Source text
- Chunk ID

**Example:**

```
Answer:
The study used a qualitative research methodology.

References:

  Page 7
  "The researchers conducted semi-structured interviews..."

  Page 8
  "Interview transcripts were analyzed..."
```

- References must come from chunks **actually retrieved** and supplied to Gemini.
- **Do not** create or fabricate references.

---

### 5. Grounded Generation

Gemini must receive the retrieved PDF content as context. The system prompt must clearly instruct Gemini:

```
Answer only using the provided document context.
Do not use outside knowledge.
If the answer is not present in the provided context, say:
  "I couldn't find that information in the uploaded document."
Do not invent or assume information.
Use the provided sources to support the answer.
The provided document context is the only source of truth.
```

The application must construct the Gemini prompt using **only retrieved PDF chunks**.

---

### 6. Gemini API

- Use the **Google Gemini API** through Gemini AI Studio for LLM generation.
- Gemini API calls must be made from the **FastAPI backend**.
- The Gemini API key must **never** be exposed to the Next.js frontend.
- Use an environment variable:

  ```env
  GEMINI_API_KEY=your_key_here
  ```

- **Never** hard-code the API key.
- Keep Gemini-specific implementation inside the service layer:

  ```
  services/
  ├── embeddings.py
  └── llm.py
  ```

- Gemini-specific code must **not** be placed directly inside API route files.

**Example service initialisation:**

```python
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)
```

---

### 7. Embeddings

- Gemini LLM generation and embeddings must be treated as **separate responsibilities**.
- The embedding provider/model must be kept separate from the LLM service.

  ```
  services/
  ├── embeddings.py   ← embedding logic
  └── llm.py          ← generation logic
  ```

- The **same** embedding model must be used for:
  - Creating document chunk embeddings
  - Creating the user's question embedding

> **Do not** mix embedding models between indexing and querying.

---

### 8. Token Usage

The application must track token usage for Gemini LLM requests whenever usage information is provided by the API.

Track at minimum:

| Field | Description |
|---|---|
| `input_tokens` | Tokens sent to the model |
| `output_tokens` | Tokens received from the model |
| `total_tokens` | Sum of input and output |

**Example API response:**

```json
{
  "usage": {
    "input_tokens": 1250,
    "output_tokens": 180,
    "total_tokens": 1430
  }
}
```

**Frontend display:**

```
Token Usage
  Input:  1,250
  Output:   180
  Total:  1,430
```

- **Do not** estimate token usage when actual usage information is available from Gemini.
- Embedding usage should also be tracked when the provider supplies it.

---

### 9. Token Efficiency

Do **not** send the entire PDF to Gemini for every question. Always use the RAG pipeline:

```
User Question
    ↓
Question Embedding
    ↓
Vector Search
    ↓
Relevant Chunks   ← only these go to Gemini
    ↓
Gemini LLM
```

- Only **relevant retrieved chunks** should be included in the Gemini context.
- The number of retrieved chunks (`top_k`) must be configurable.
- Avoid unnecessarily large prompts.

---

### 10. Cost Tracking

- If cost tracking is implemented, keep **token usage separate** from cost calculation.
- **Do not** hard-code Gemini pricing throughout the application.
- Pricing must be configurable.
- Any calculated cost must be clearly labelled as an **estimate** unless it comes directly from an authoritative billing source.

---

### 11. Security

**Never expose** the following to the frontend:
- `GEMINI_API_KEY`
- Internal system prompts
- Stack traces
- Provider credentials
- Sensitive configuration

Additional requirements:
- Keep API keys on the FastAPI server only.
- **Never** commit `.env` files.
- Validate all uploaded PDF files server-side.
- Limit PDF file size.
- Verify document ownership when authentication is implemented.
- Never expose sensitive server errors to users.
- Restrict vector retrieval to the authorised document.

---

## Code Organisation

Keep API routes separate from business logic.

**Recommended backend structure:**

```
app/
├── api/
│   └── ...                 # Endpoints and request handling
│
├── services/
│   ├── pdf.py              # PDF text extraction
│   ├── chunking.py         # Text splitting
│   ├── embeddings.py       # Embedding generation
│   ├── retrieval.py        # Vector similarity search
│   └── llm.py              # Gemini communication & RAG context
│
├── models/
│   └── ...                 # SQLAlchemy database models
│
├── schemas/
│   └── ...                 # Pydantic request/response schemas
│
├── db/
│   └── ...                 # Database configuration & session management
│
└── main.py                 # FastAPI app configuration & route registration
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| `api/` | Endpoints, request validation, response serialisation |
| `services/` | PDF processing, chunking, embeddings, retrieval, Gemini communication, RAG context |
| `models/` | SQLAlchemy ORM models |
| `schemas/` | Pydantic request and response schemas |
| `db/` | Database config and session management |
| `main.py` | App creation and router registration — **do not** put business logic here |

---

## Backend Rules

Use the following technologies:

- **FastAPI** for the API
- **Uvicorn** to run the server
- **Pydantic** for request/response validation
- **SQLAlchemy** for database interaction
- **PostgreSQL + pgvector** for vector storage
- **Alembic** for database migrations
- **PyMuPDF** for PDF processing
- **Gemini API** for LLM generation
- A dedicated embedding model for embeddings

Additional requirements:
- Keep AI provider logic inside service modules.
- Track actual Gemini token usage when available.
- Return references with every generated answer.
- Always scope vector retrieval to the selected `document_id`.

---

## Frontend Rules

Use the following technologies:

- **Next.js**
- **TypeScript**
- **React**
- **Tailwind CSS**

Additional requirements:
- Keep all API communication in a dedicated API module (`lib/api.ts`).
- Do **not** expose backend secrets.
- Show loading states for all async operations.
- Show error states clearly.
- Display answers, PDF references, page numbers, source excerpts, and token usage.
- Keep UI components separate from business logic.

**Example UI output:**

```
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
  Input:  1,250 tokens
  Output:   180 tokens
  Total:  1,430 tokens
```

---

## Database Rules

Use **PostgreSQL + pgvector**.

Documents and chunks must be associated:

```
documents
    ↓
document_chunks
```

Each chunk must contain:

| Field | Type |
|---|---|
| `document_id` | Foreign key |
| `page_number` | Integer |
| `chunk_index` | Integer |
| `content` | Text |
| `embedding` | Vector |

Vector searches **must always** filter by `document_id`:

```sql
SELECT *
FROM document_chunks
WHERE document_id = :document_id
ORDER BY embedding <=> :query_embedding
LIMIT :top_k;
```

> **Never** perform an unrestricted vector search across all documents.

---

## RAG Context Construction

Retrieved chunks must be converted into a structured context before being sent to Gemini.

**Example context format:**

```
Document Context:

[Chunk ID: 12 | Page 7]
The researchers conducted semi-structured interviews...

[Chunk ID: 13 | Page 8]
Interview transcripts were analyzed...
```

Gemini must be instructed to use this context as the **only** source of information.

The application must preserve the traceability chain:

```
Gemini Answer
     ↓
Retrieved Chunks
     ↓
Document Page Numbers
```

---

## API Response Structure

The question-answer endpoint must return enough information for the frontend to display answers, references, and token usage.

```json
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
```

- **Do not** fabricate reference information.
- References must correspond to chunks actually retrieved and supplied to Gemini.

---

## Error Handling

**Never** expose raw provider errors to the frontend.

Do **not** return:
```
google.api_core.exceptions...
Traceback (most recent call last): ...
```

Instead, return a safe API error:

```json
{
  "detail": "Unable to generate an answer at this time."
}
```

- Detailed errors must be **logged on the backend** for debugging.
- Never expose API keys, internal prompts, stack traces, provider credentials, or sensitive configuration to clients.

---

## Simplicity

Do **not** over-engineer the MVP. The initial architecture must remain:

```
Next.js
   ↓
FastAPI
   ↓
PostgreSQL + pgvector
   ↓
Embedding Provider
   ↓
Gemini API
```

Do **not** add the following unless there is a clear, documented requirement:

- Kafka / message queues
- Kubernetes / container orchestration
- Microservices
- Multiple databases
- Redis / caching layers
- Complex agent frameworks

---

## Code Quality

| Rule | Requirement |
|---|---|
| Readability | Write clean, readable, self-documenting code |
| Naming | Use meaningful names for variables, functions, and modules |
| Python types | Use type hints on all functions and variables |
| TypeScript types | Use explicit TypeScript types; avoid `any` |
| Abstractions | Avoid unnecessary abstractions |
| Duplication | Avoid duplicated code |
| Function size | Keep functions focused and reasonably small |
| API keys | Never hard-code API keys |
| Pricing | Never hard-code AI pricing |
| Tests | Add tests for important functionality |
| Provider code | Keep provider-specific code inside service modules |
| Routes | Keep API routes thin |
| Business logic | Keep business logic inside services |

---

## Agent Rules

When modifying this project, an agent **must**:

- [ ] Inspect the existing code before making any changes
- [ ] Not overwrite working code unnecessarily
- [ ] Follow the existing project structure
- [ ] Follow every rule in this file
- [ ] Preserve PDF page metadata in all chunk operations
- [ ] Never fabricate answers or references
- [ ] Always scope retrieval to the selected `document_id`
- [ ] Keep Gemini API keys out of source code and frontend
- [ ] Use environment variables for all secrets
- [ ] Track actual Gemini token usage when available
- [ ] Not send the entire PDF to Gemini unnecessarily
- [ ] Use only retrieved PDF content for document questions
- [ ] Not introduce unnecessary dependencies or architecture
- [ ] Explain significant architectural changes before implementing them
- [ ] Keep the implementation simple and maintainable
- [ ] Ensure generated answers can be traced back to PDF references
- [ ] Keep Gemini-specific implementation inside service modules
- [ ] Use the **same** embedding model for indexing and querying
- [ ] Never perform vector retrieval without `document_id` filtering

---

## Final Architecture

```
                    ┌──────────────────┐
                    │    Next.js UI    │
                    └────────┬─────────┘
                             │ HTTP
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
```

---

## Core Principle

> **The PDF is the source of truth.**

1. Retrieve relevant PDF chunks first.
2. Send **only** those chunks to Gemini.
3. Gemini must answer using **only** the retrieved PDF context.
4. Every answer must be traceable to the retrieved chunks and their original page numbers.
5. The Gemini API key must remain on the FastAPI backend and **must never** be exposed to the frontend.
