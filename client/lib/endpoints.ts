export const ENDPOINTS = {

  DOCUMENTS: "/api/documents",
  UPLOAD_DOCUMENT: "/api/documents/upload",
  DELETE_DOCUMENT: (documentId: number) => `/api/documents/${documentId}`,
  CHAT_HISTORY: (documentId: number) => `/api/chat/${documentId}`,
  CHAT: "/api/chat",
  
} as const;