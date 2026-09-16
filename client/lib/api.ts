import axios from "axios";

import {
  ChatHistoryItem,
  ChatRequest,
  ChatResponse,
  DeleteDocumentResponse,
  DocumentSummary,
  UploadDocumentResponse,
} from "@/types";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000",
});

export async function getDocuments(): Promise<
  DocumentSummary[]
> {
  const response =
    await api.get<DocumentSummary[]>(
      "/api/documents"
    );

  return response.data;
}

export async function uploadDocument(
  file: File,
  onUploadProgress?: (percent: number) => void
): Promise<UploadDocumentResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await api.post<UploadDocumentResponse>(
      "/api/documents/upload",
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      }
    );

  return response.data;
}

export async function deleteDocument(
  documentId: number
): Promise<DeleteDocumentResponse> {
  const response =
    await api.delete<DeleteDocumentResponse>(
      `/api/documents/${documentId}`
    );

  return response.data;
}

export async function getChatHistory(
  documentId: number
): Promise<ChatHistoryItem[]> {
  const response =
    await api.get<ChatHistoryItem[]>(
      `/api/chat/${documentId}`
    );

  return response.data;
}

export async function askQuestion(
  data: ChatRequest
): Promise<ChatResponse> {
  const response =
    await api.post<ChatResponse>(
      "/api/chat",
      data
    );

  return response.data;
}

export default api;