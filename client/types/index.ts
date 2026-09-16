export interface UploadDocumentResponse {
  message: string;
  document_id: number;
  filename: string;
  pages: number;
  chunks: number;
}

export interface ChatRequest {
  document_id: number;
  question: string;
  top_k?: number;
}

export interface Reference {
  chunk_id: number;
  page_number: number;
  source_text: string;
}

export interface TokenUsage {
  prompt_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  [key: string]: unknown;
}

export interface ChatResponse {
  answer: string;
  references: Reference[];
  usage: TokenUsage;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: Reference[];
  usage?: TokenUsage;
}

export interface DocumentSummary {
  document_id: number;
  filename: string;
  pages: number;
  chunks: number;
}

export interface ChatHistoryItem {
  id: number;
  document_id: number;
  question: string;
  answer: string;
  created_at?: string | null;
}

export interface DeleteDocumentResponse {
  message: string;
  document_id: number;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}