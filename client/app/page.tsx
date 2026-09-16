"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Layers3, Sparkles } from "lucide-react";

import Chat from "@/components/Chat";
import DeleteDocumentModal from "@/components/DeleteDocumentModal";
import DocumentSidebar from "@/components/DocumentSidebar";
import EmptyDocumentState from "@/components/EmptyDocumentState";
import Header from "@/components/Header";
import MobileDrawer from "@/components/MobileDrawer";
import { useToast } from "@/components/Toast";

import { deleteDocument, getDocuments } from "@/lib/api";
import { DocumentSummary, UploadDocumentResponse } from "@/types";

export default function Home() {
  const { toast } = useToast();

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [document, setDocument] = useState<DocumentSummary | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  // Document deletion modal state
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Mobile navigation drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --------------------------------------------------
  // Load existing documents
  // --------------------------------------------------

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const result = await getDocuments();
        setDocuments(result);

        // Automatically open newest document if exists
        if (result.length > 0) {
          setDocument(result[0]);
        }
      } catch (error: unknown) {
        console.error("Failed to load documents:", error);
        toast.error("Failed to load documents. Please check your connection.");
      } finally {
        setLoadingDocuments(false);
      }
    };

    loadDocuments();
  }, []);

  // --------------------------------------------------
  // Close delete modal on Escape key
  // --------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && documentToDelete && !deleting) {
        setDocumentToDelete(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [documentToDelete, deleting]);

  // --------------------------------------------------
  // Document uploaded
  // --------------------------------------------------

  const handleUploaded = (result: UploadDocumentResponse) => {
    const newDocument: DocumentSummary = {
      document_id: result.document_id,
      filename: result.filename,
      pages: result.pages,
      chunks: result.chunks,
    };

    // Add new document to list
    setDocuments((previous) => [
      newDocument,
      ...previous.filter(
        (item) => item.document_id !== newDocument.document_id,
      ),
    ]);

    // Open uploaded document
    setDocument(newDocument);
  };

  // --------------------------------------------------
  // Select document
  // --------------------------------------------------

  const selectDocument = (selectedDocument: DocumentSummary) => {
    setDocument(selectedDocument);
    setMobileMenuOpen(false);
  };

  // --------------------------------------------------
  // New PDF
  // --------------------------------------------------

  const resetDocument = () => {
    setDocument(null);
    setMobileMenuOpen(false);
  };

  // --------------------------------------------------
  // Delete document
  // --------------------------------------------------

  const handleConfirmDelete = async () => {
    if (!documentToDelete || deleting) return;

    setDeleting(true);

    try {
      await deleteDocument(documentToDelete.document_id);

      setDocuments((previous) =>
        previous.filter(
          (item) => item.document_id !== documentToDelete.document_id,
        ),
      );

      // If deleted document was active, reset to upload / home view
      if (document?.document_id === documentToDelete.document_id) {
        setDocument(null);
      }

      toast.success("Document deleted successfully.");
      setDocumentToDelete(null);
    } catch (err: unknown) {
      let message = "Failed to delete document.";
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorData = (err as { response?: { data?: { detail?: string } } })
          .response?.data;
        if (typeof errorData?.detail === "string") {
          message = errorData.detail;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(`Document deletion failure: ${message}`);
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loadingDocuments) {
    return (
      <main className="flex h-screen items-center justify-center bg-zinc-100">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
            <Sparkles size={26} className="animate-pulse text-violet-600" />
          </div>

          <p className="mt-4 text-sm font-medium text-zinc-700">
            Loading your documents...
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            Connecting to your workspace
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-zinc-100">
      {/* Desktop Sidebar */}
      <DocumentSidebar
        documents={documents}
        selectedDocument={document}
        onSelect={selectDocument}
        onDelete={setDocumentToDelete}
        onNewDocument={resetDocument}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileMenuOpen}
        documents={documents}
        selectedDocument={document}
        onClose={() => setMobileMenuOpen(false)}
        onSelect={selectDocument}
        onDelete={setDocumentToDelete}
        onNewDocument={resetDocument}
      />

      {/* Main Workspace */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <Header
          document={document}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNewDocument={resetDocument}
          onDeleteDocument={() => setDocumentToDelete(document)}
        />

        {/* Content Area */}
        {!document ? (
          <EmptyDocumentState onUploaded={handleUploaded} />
        ) : (
          <>
            <Chat documentId={document.document_id} />
          </>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <DeleteDocumentModal
        document={documentToDelete}
        deleting={deleting}
        onCancel={() => setDocumentToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
