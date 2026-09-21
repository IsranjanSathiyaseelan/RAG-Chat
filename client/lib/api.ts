import axios from "axios";

import {
  ChatHistoryItem,
  ChatRequest,
  ChatResponse,
  DeleteDocumentResponse,
  DocumentSummary,
  UploadDocumentResponse,
} from "@/types";

import { ENDPOINTS } from "./endpoints";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const SERVER_UNAVAILABLE_MESSAGE = "Server is not working.";

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.serverUnavailable = true;
      error.message = SERVER_UNAVAILABLE_MESSAGE;
    }

    return Promise.reject(error);
  }
);

export async function getDocuments(): Promise<DocumentSummary[]> {
  const response = await api.get<DocumentSummary[]>(
    ENDPOINTS.DOCUMENTS
  );

  return response.data;
}

export async function uploadDocument(
  file: File,
  onUploadProgress?: (percent: number) => void
): Promise<UploadDocumentResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<UploadDocumentResponse>(
    ENDPOINTS.UPLOAD_DOCUMENT,
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
  const response = await api.delete<DeleteDocumentResponse>(
    ENDPOINTS.DELETE_DOCUMENT(documentId)
  );

  return response.data;
}

export async function getChatHistory(
  documentId: number
): Promise<ChatHistoryItem[]> {
  const response = await api.get<ChatHistoryItem[]>(
    ENDPOINTS.CHAT_HISTORY(documentId)
  );

  return response.data;
}

export async function askQuestion(
  data: ChatRequest
): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>(
    ENDPOINTS.CHAT,
    data
  );

  return response.data;
}

export default api;