# RAG-Chat

> A full-stack **Retrieval-Augmented Generation (RAG)** application that lets you upload PDF documents and ask natural-language questions about them — powered by **Google Gemini**, **pgvector**, and **Next.js**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [License](#license)

---

## Overview

RAG-Chat allows users to upload PDF files and interact with their content through a conversational interface. Instead of relying on general knowledge, every answer is grounded in the actual text of the uploaded document — with source page references included in every response.

---

## Features

- 📄 **PDF Upload** — Upload PDFs up to 10 MB via drag-and-drop or file picker
- 🔍 **Semantic Search** — Chunks are embedded with Google Gemini and stored in pgvector for fast similarity retrieval
- 🤖 **Grounded Answers** — Responses are generated strictly from retrieved document content, with page and chunk references
- 💬 **Persistent Chat History** — Previous conversations per document are stored in PostgreSQL and restored on reload
- 🗂️ **Multi-Document Support** — Manage and switch between multiple uploaded documents
- 📱 **Responsive UI** — Fully responsive layout with mobile drawer navigation
- ⚡ **Graceful Error Handling** — Clear feedback when the backend is unavailable, without leaking raw errors

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Next.js)                   │
│  Upload PDF ──► Chat UI ──► Document Sidebar            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (Axios)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Backend                         │
│                                                         │
│  POST /api/documents/upload                             │
│    └─ PyMuPDF → chunk text → Gemini embed → pgvector   │
│                                                         │
│  POST /api/chat                                         │
│    └─ embed question → pgvector similarity search       │
│       → Gemini generate answer → store in DB           │
│                                                         │
│  GET  /api/documents     GET  /api/chat/{doc_id}       │
│  DELETE /api/documents/{id}                             │
└──────────────────┬──────────────────────────────────────┘
                   │ SQLAlchemy + psycopg
                   ▼
┌─────────────────────────────────────────────────────────┐
│         PostgreSQL + pgvector extension                 │
│  Tables: documents · chunks · chat_history              │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | React framework with App Router |
| [React 19](https://react.dev) | UI library |
| [TypeScript](https://www.typescriptlang.org) | Static typing |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [Axios](https://axios-http.com) | HTTP client with interceptors |
| [Lucide React](https://lucide.dev) | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | Async REST API framework |
| [Google Gemini (`google-genai`)](https://ai.google.dev) | Text embedding & generation |
| [PostgreSQL + pgvector](https://github.com/pgvector/pgvector) | Vector similarity search |
| [SQLAlchemy 2](https://www.sqlalchemy.org) | ORM & database management |
| [Alembic](https://alembic.sqlalchemy.org) | Database migrations |
| [PyMuPDF](https://pymupdf.readthedocs.io) | PDF parsing & text extraction |
| [Uvicorn](https://www.uvicorn.org) | ASGI server |
| [Python 3.14+](https://www.python.org) | Runtime |

---

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** >= 18 and **npm**
- **Python** >= 3.14 and **uv** (recommended) or **pip**
- **PostgreSQL** with the **pgvector** extension enabled
- A **Google AI API key** with access to the Gemini embedding and generation models

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/RAG-Chat.git
cd RAG-Chat
```

---

### 2. Backend Setup

```bash
cd server
```

**Install dependencies** (using `uv`):

```bash
uv sync
```

Or using `pip`:

```bash
pip install -r requirements.txt
```

**Configure environment variables:**

```bash
cp .env.example .env
# Edit .env — see the Environment Variables section below
```

**Run database migrations:**

```bash
alembic upgrade head
```

**Start the development server:**

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://127.0.0.1:8000`.
Interactive docs: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

```bash
cd client
```

**Install dependencies:**

```bash
npm install
```

**Configure environment variables:**

```bash
cp .env.local.example .env.local
# Edit .env.local — see the Environment Variables section below
```

**Start the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend — `server/.env`

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg://user:pass@localhost:5432/ragchat` |
| `GEMINI_API_KEY` | Google AI API key | `AIza...` |
| `UPLOAD_DIR` | Directory for uploaded PDFs | `./uploads` |

### Frontend — `client/.env.local`

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://127.0.0.1:8000` |

---

## Project Structure

```
RAG-Chat/
├── client/                      # Next.js frontend
│   ├── app/
│   │   ├── page.tsx             # Main application page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── Chat.tsx             # Chat interface & message history
│   │   ├── PdfUpload.tsx        # Drag-and-drop PDF uploader
│   │   ├── DocumentSidebar.tsx  # Desktop document list
│   │   ├── MobileDrawer.tsx     # Mobile navigation drawer
│   │   ├── DocumentList.tsx     # Shared document list component
│   │   ├── Message.tsx          # Individual chat message
│   │   ├── Sources.tsx          # Source reference display
│   │   ├── Header.tsx           # Top navigation bar
│   │   ├── Toast.tsx            # Toast notification system
│   │   └── Loading.tsx          # Full-page loading state
│   ├── lib/
│   │   └── api.ts               # Axios client & all API functions
│   └── types/                   # Shared TypeScript types
│
└── server/                      # FastAPI backend
    ├── app/
    │   ├── main.py              # FastAPI app entry point
    │   ├── api/                 # Route handlers (documents, chat)
    │   ├── services/            # Business logic (RAG pipeline)
    │   ├── models/              # SQLAlchemy ORM models
    │   ├── schemas/             # Pydantic request/response schemas
    │   └── db/                  # Database session & connection
    └── alembic/                 # Database migration scripts
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/documents` | List all uploaded documents |
| `POST` | `/api/documents/upload` | Upload and process a PDF file |
| `DELETE` | `/api/documents/{id}` | Delete a document and its data |
| `GET` | `/api/chat/{document_id}` | Get chat history for a document |
| `POST` | `/api/chat` | Ask a question about a document |

Full interactive API documentation is available at `http://127.0.0.1:8000/docs` when the backend is running.

---
