# RAG-Chat

A full-stack Retrieval-Augmented Generation (RAG) app. Upload a PDF, then ask questions about it in plain language. Answers are generated with Google Gemini, using document text retrieved from PostgreSQL with pgvector. The frontend is built with Next.js.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)

## Overview

RAG-Chat lets you chat with the contents of your PDF files. Instead of relying on general knowledge, the app answers from the text of the document you uploaded, and every answer includes the source page and chunk references.

## Features

- **PDF upload:** Upload PDFs up to 10 MB by drag-and-drop or file picker.
- **Semantic search:** Document text is split into chunks, embedded with Google Gemini, and stored in pgvector for fast similarity search.
- **Grounded answers:** Responses are generated only from the retrieved document content, with page and chunk references.
- **Persistent chat history:** Conversations are saved per document in PostgreSQL and restored when you reload.
- **Multiple documents:** Upload several documents and switch between them.
- **Responsive UI:** The layout adapts to mobile screens, with a drawer for navigation.
- **Graceful error handling:** If the backend is unavailable, the app shows a clear message instead of a raw error.

## Architecture

```
Browser (Next.js)
  Upload PDF -> Chat UI -> Document sidebar
        |
        | HTTP (Axios)
        v
FastAPI backend
  POST /api/documents/upload
    PyMuPDF -> chunk text -> Gemini embeddings -> pgvector
  POST /api/chat
    embed question -> pgvector similarity search
    -> Gemini generates answer -> save to database
  GET    /api/documents
  GET    /api/chat/{document_id}
  DELETE /api/documents/{id}
        |
        | SQLAlchemy + psycopg
        v
PostgreSQL + pgvector
  Tables: documents, chunks, chat_history
```

## Tech Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| [Next.js 16](https://nextjs.org) | React framework (App Router) |
| [React 19](https://react.dev) | UI library |
| [TypeScript](https://www.typescriptlang.org) | Static typing |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Axios](https://axios-http.com) | HTTP client with interceptors |
| [Lucide React](https://lucide.dev) | Icons |

### Backend

| Technology | Purpose |
| --- | --- |
| [FastAPI](https://fastapi.tiangolo.com) | Async REST API framework |
| [Google Gemini (`google-genai`)](https://ai.google.dev) | Text embeddings and answer generation |
| [PostgreSQL + pgvector](https://github.com/pgvector/pgvector) | Vector similarity search |
| [SQLAlchemy 2](https://www.sqlalchemy.org) | ORM and database access |
| [Alembic](https://alembic.sqlalchemy.org) | Database migrations |
| [PyMuPDF](https://pymupdf.readthedocs.io) | PDF parsing and text extraction |
| [Uvicorn](https://www.uvicorn.org) | ASGI server |
| [Python 3.14+](https://www.python.org) | Runtime |

## Prerequisites

Install the following before you start:

- Node.js 18 or newer, and npm
- Python 3.14 or newer, and `uv` (recommended) or `pip`
- PostgreSQL with the pgvector extension enabled
- A Google AI API key with access to the Gemini embedding and generation models

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/RAG-Chat.git
cd RAG-Chat
```

### 2. Set up the backend

Go to the backend folder:

```bash
cd server
```

Install dependencies with `uv`:

```bash
uv sync
```

Or with `pip`:

```bash
pip install -r requirements.txt
```

Create your environment file, then edit `.env` using the [Environment Variables](#environment-variables) section below:

```bash
cp .env.example .env
```

Run the database migrations:

```bash
alembic upgrade head
```

Start the development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API runs at `http://127.0.0.1:8000`, and interactive docs are at `http://127.0.0.1:8000/docs`.

### 3. Set up the frontend

Open a second terminal and go to the frontend folder:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create your environment file, then edit `.env.local`:

```bash
cp .env.local.example .env.local
```

Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg://user:pass@localhost:5432/ragchat` |
| `GEMINI_API_KEY` | Google AI API key | `AIza...` |
| `UPLOAD_DIR` | Folder where uploaded PDFs are stored | `./uploads` |

### Frontend (`client/.env.local`)

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend | `http://127.0.0.1:8000` |

## Project Structure

```
RAG-Chat/
├── client/                      # Next.js frontend
│   ├── app/
│   │   ├── page.tsx             # Main page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── Chat.tsx             # Chat interface and message history
│   │   ├── PdfUpload.tsx        # Drag-and-drop PDF uploader
│   │   ├── DocumentSidebar.tsx  # Desktop document list
│   │   ├── MobileDrawer.tsx     # Mobile navigation drawer
│   │   ├── DocumentList.tsx     # Shared document list component
│   │   ├── Message.tsx          # Single chat message
│   │   ├── Sources.tsx          # Source reference display
│   │   ├── Header.tsx           # Top navigation bar
│   │   ├── Toast.tsx            # Toast notifications
│   │   └── Loading.tsx          # Full-page loading state
│   ├── lib/
│   │   └── api.ts               # Axios client and API functions
│   └── types/                   # Shared TypeScript types
│
└── server/                      # FastAPI backend
    ├── app/
    │   ├── main.py              # App entry point
    │   ├── api/                 # Route handlers (documents, chat)
    │   ├── services/            # Business logic (RAG pipeline)
    │   ├── models/              # SQLAlchemy ORM models
    │   ├── schemas/             # Pydantic request/response schemas
    │   └── db/                  # Database session and connection
    └── alembic/                 # Migration scripts
```

## API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/documents` | List all uploaded documents |
| `POST` | `/api/documents/upload` | Upload and process a PDF |
| `DELETE` | `/api/documents/{id}` | Delete a document and its data |
| `GET` | `/api/chat/{document_id}` | Get the chat history for a document |
| `POST` | `/api/chat` | Ask a question about a document |

Full interactive docs are available at `http://127.0.0.1:8000/docs` while the backend is running.
