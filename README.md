# RAG-Chat

> A full-stack **Retrieval-Augmented Generation (RAG)** application that lets you upload PDF documents and ask natural-language questions about them — powered by **Google Gemini**, **pgvector**, **Docker**, **Kubernetes**, and **Next.js**.

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Architecture](#architecture)
* [Tech Stack](#tech-stack)
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)

  * [1. Clone the Repository](#1-clone-the-repository)
  * [2. Run with Docker Compose](#2-run-with-docker-compose)
  * [3. Run with Kubernetes](#3-run-with-kubernetes)
  * [4. Run Manually](#4-run-manually)
* [Environment Variables](#environment-variables)
* [Project Structure](#project-structure)
* [API Reference](#api-reference)
* [License](#license)

---

## Overview

RAG-Chat allows users to upload PDF files and interact with their content through a conversational interface.

Instead of relying on general knowledge, every answer is grounded in the actual text of the uploaded document, with source page references included in responses.

The application consists of:

* **Next.js frontend** for the chat interface
* **FastAPI backend** for the RAG pipeline
* **PostgreSQL + pgvector** for document storage and vector similarity search
* **Google Gemini** for embeddings and answer generation
* **Docker** for containerized development and deployment
* **Kubernetes** for container orchestration

---

## Features

* 📄 **PDF Upload** — Upload PDFs up to 10 MB via drag-and-drop or file picker
* 🔍 **Semantic Search** — Chunks are embedded with Google Gemini and stored in pgvector for similarity retrieval
* 🤖 **Grounded Answers** — Responses are generated from retrieved document content
* 💬 **Persistent Chat History** — Previous conversations per document are stored in PostgreSQL
* 🗂️ **Multi-Document Support** — Manage and switch between multiple uploaded documents
* 📱 **Responsive UI** — Fully responsive layout with mobile drawer navigation
* ⚡ **Graceful Error Handling** — Clear feedback when the backend is unavailable
* 🐳 **Docker Support** — Frontend, backend, and PostgreSQL can be containerized
* ☸️ **Kubernetes Support** — Frontend, backend, and PostgreSQL can be deployed as Kubernetes workloads

---

## Architecture

### Application Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│                      Next.js Frontend                       │
│                                                             │
│       PDF Upload ──► Chat UI ──► Document Sidebar           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTP
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                         │
│                                                             │
│  POST /api/documents/upload                                 │
│      │                                                      │
│      ├── PyMuPDF → Extract PDF text                         │
│      ├── Chunk document                                     │
│      ├── Gemini → Generate embeddings                       │
│      └── pgvector → Store document vectors                  │
│                                                             │
│  POST /api/chat                                             │
│      │                                                      │
│      ├── Embed user question                                │
│      ├── pgvector similarity search                         │
│      ├── Retrieve relevant document chunks                  │
│      └── Gemini → Generate grounded answer                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ SQLAlchemy + psycopg
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 PostgreSQL + pgvector                       │
│                                                             │
│       documents  │  document_chunks  │  chat_history        │
└─────────────────────────────────────────────────────────────┘
```

### Container Architecture

```text
                    Kubernetes Cluster
                           │
             ┌─────────────┴─────────────┐
             │                           │
      Frontend Pod(s)              Backend Pod(s)
       Next.js                     FastAPI
             │                           │
             │                           │
             └──────────────┬────────────┘
                            │
                            ▼
                    PostgreSQL Pod
                      + pgvector
```

Kubernetes Services provide stable networking between the application components while allowing pods to be recreated or scaled independently.

---

## Tech Stack

### Frontend

| Technology      | Purpose                         |
| --------------- | ------------------------------- |
| Next.js 16      | React framework with App Router |
| React 19        | UI library                      |
| TypeScript      | Static typing                   |
| Tailwind CSS v4 | Utility-first styling           |
| Axios           | HTTP client                     |
| Lucide React    | Icon library                    |

### Backend

| Technology            | Purpose                       |
| --------------------- | ----------------------------- |
| FastAPI               | Async REST API framework      |
| Google Gemini         | Text embedding & generation   |
| PostgreSQL + pgvector | Vector similarity search      |
| SQLAlchemy 2          | ORM & database management     |
| Alembic               | Database migrations           |
| PyMuPDF               | PDF parsing & text extraction |
| Uvicorn               | ASGI server                   |
| Python 3.14+          | Runtime                       |

### DevOps & Deployment

| Technology             | Purpose                              |
| ---------------------- | ------------------------------------ |
| Docker                 | Containerization                     |
| Docker Compose         | Local multi-container development    |
| Kubernetes             | Container orchestration              |
| Kubernetes Services    | Stable service-to-service networking |
| Kubernetes Deployments | Managing application pods            |

---

## Prerequisites

### For Manual Development

Make sure you have:

* **Node.js** >= 18
* **npm**
* **Python** >= 3.14
* **uv** or **pip**
* **PostgreSQL**
* **pgvector** PostgreSQL extension
* Google AI API key with access to the required Gemini models

### For Docker

* **Docker**
* **Docker Compose**

### For Kubernetes

* **Docker**
* **kubectl**
* A running Kubernetes cluster such as:

  * Minikube
  * Docker Desktop Kubernetes
  * Kind
  * A cloud Kubernetes cluster

---

# Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/IsranjanSathiyaseelan/RAG-Chat.git
cd RAG-Chat
```

---

## 2. Run with Docker Compose

Docker Compose provides the easiest way to run the complete application locally.

The project includes:

```text
docker-compose.yml
```

Build and start the containers:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up --build -d
```

Check running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop the application:

```bash
docker compose down
```

The application will be available at:

```text
http://localhost:3000
```

The backend API will be available at:

```text
http://localhost:8000
```

Interactive FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# 3. Run with Kubernetes

The project includes Kubernetes manifests in the `k8s/` directory:

```text
k8s/
├── backend.yaml
├── frontend.yaml
└── postgres.yaml
```

These manifests define the Kubernetes resources required to run the application components.

### Start a local Kubernetes cluster

For example, with Minikube:

```bash
minikube start
```

Verify the cluster:

```bash
kubectl get nodes
```

---

### Build the Docker Images

Build the backend image:

```bash
docker build -t rag-chat-backend ./server
```

Build the frontend image:

```bash
docker build -t rag-chat-frontend ./client
```

If using Minikube, make the images available inside the Minikube environment:

```bash
eval $(minikube docker-env)
```

Then rebuild the images:

```bash
docker build -t rag-chat-backend ./server
docker build -t rag-chat-frontend ./client
```

---

### Deploy PostgreSQL

```bash
kubectl apply -f k8s/postgres.yaml
```

Check the PostgreSQL resources:

```bash
kubectl get pods
```

---

### Deploy the Backend

```bash
kubectl apply -f k8s/backend.yaml
```

Check the backend:

```bash
kubectl get pods
kubectl get services
```

---

### Deploy the Frontend

```bash
kubectl apply -f k8s/frontend.yaml
```

Check all application resources:

```bash
kubectl get pods
kubectl get services
```

You should see resources for:

```text
PostgreSQL
Backend
Frontend
```

---

### Check Deployment Status

```bash
kubectl get deployments
```

Check pods:

```bash
kubectl get pods
```

Check services:

```bash
kubectl get services
```

View backend logs:

```bash
kubectl logs <backend-pod-name>
```

View frontend logs:

```bash
kubectl logs <frontend-pod-name>
```

---

### Access the Application

If using Minikube, you can access a Kubernetes service with:

```bash
minikube service <frontend-service-name>
```

Alternatively, check the service:

```bash
kubectl get services
```

For local testing, you can also use port forwarding:

```bash
kubectl port-forward service/<frontend-service-name> 3000:3000
```

Then open:

```text
http://localhost:3000
```

---

### Remove the Kubernetes Deployment

To remove the application:

```bash
kubectl delete -f k8s/frontend.yaml
kubectl delete -f k8s/backend.yaml
kubectl delete -f k8s/postgres.yaml
```

---

# 4. Run Manually

If you don't want to use Docker or Kubernetes, you can run the frontend and backend directly.

## Backend

```bash
cd server
```

Install dependencies using `uv`:

```bash
uv sync
```

Or using pip:

```bash
pip install -r requirements.txt
```

Configure the environment variables and run migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend

Open another terminal:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# Environment Variables

## Backend — `server/.env`

| Variable         | Description                  | Example                                                 |
| ---------------- | ---------------------------- | ------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | `postgresql+psycopg://user:pass@localhost:5432/ragchat` |
| `GEMINI_API_KEY` | Google AI API key            | `AIza...`                                               |
| `UPLOAD_DIR`     | Directory for uploaded PDFs  | `./uploads`                                             |

---

## Frontend — `client/.env.local`

| Variable              | Description      | Default                 |
| --------------------- | ---------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://127.0.0.1:8000` |

When running with Kubernetes, make sure the frontend's API URL points to the appropriate backend endpoint exposed by the Kubernetes configuration.

---

# Project Structure

```text
RAG-Chat/
│
├── client/                         # Next.js frontend
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── Chat.tsx
│   │   ├── DeleteDocumentModal.tsx
│   │   ├── DocumentList.tsx
│   │   ├── DocumentSidebar.tsx
│   │   ├── EmptyDocumentState.tsx
│   │   ├── Header.tsx
│   │   ├── Loading.tsx
│   │   ├── Message.tsx
│   │   ├── PdfUpload.tsx
│   │   ├── Sources.tsx
│   │   └── Toast.tsx
│   │
│   ├── images/
│   │   └── logo.svg
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   └── endpoints.ts
│   │
│   ├── public/
│   ├── types/
│   │   └── index.ts
│   │
│   ├── Dockerfile
│   └── package.json
│
├── k8s/                            # Kubernetes manifests
│   ├── backend.yaml                # Backend deployment/service
│   ├── frontend.yaml               # Frontend deployment/service
│   └── postgres.yaml               # PostgreSQL deployment/service
│
├── server/                         # FastAPI backend
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py
│   │   │   └── documents.py
│   │   │
│   │   ├── db/
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── chat.py
│   │   │   ├── document.py
│   │   │   └── document_chunk.py
│   │   │
│   │   ├── schemas/
│   │   │   └── chat.py
│   │   │
│   │   ├── services/
│   │   │   ├── chunking.py
│   │   │   ├── embeddings.py
│   │   │   ├── llm.py
│   │   │   ├── pdf.py
│   │   │   └── retrieval.py
│   │   │
│   │   └── main.py
│   │
│   ├── uploads/
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── uv.lock
│
├── docker-compose.yml               # Local container orchestration
├── .gitignore
└── README.md
```

---

# API Reference

| Method   | Endpoint                  | Description                     |
| -------- | ------------------------- | ------------------------------- |
| `GET`    | `/api/documents`          | List all uploaded documents     |
| `POST`   | `/api/documents/upload`   | Upload and process a PDF file   |
| `DELETE` | `/api/documents/{id}`     | Delete a document and its data  |
| `GET`    | `/api/chat/{document_id}` | Get chat history for a document |
| `POST`   | `/api/chat`               | Ask a question about a document |

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Deployment Options

RAG-Chat supports three ways of running the application:

### Local Development

```text
Next.js
   │
FastAPI
   │
PostgreSQL + pgvector
```

### Docker Compose

```text
┌──────────────┐
│   Frontend   │
│   Container  │
└──────┬───────┘
       │
┌──────▼───────┐
│   Backend    │
│   Container  │
└──────┬───────┘
       │
┌──────▼─────────────┐
│ PostgreSQL         │
│ + pgvector         │
│    Container       │
└────────────────────┘
```

### Kubernetes

```text
┌──────────────────────── Kubernetes Cluster ────────────────────────┐
│                                                                    │
│   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐  │
│   │  Frontend    │       │   Backend    │       │ PostgreSQL   │  │
│   │ Deployment   │──────►│ Deployment   │──────►│   + pgvector │  │
│   │              │       │              │       │              │  │
│   └──────────────┘       └──────────────┘       └──────────────┘  │
│          │                       │                       │          │
│      Service                  Service                  Service      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

Kubernetes provides service discovery and stable networking between the frontend, backend, and database workloads while allowing application pods to be managed independently.

---

## License

This project is intended for educational and development purposes.
