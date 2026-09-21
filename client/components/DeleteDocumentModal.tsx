"use client";

import { Loader2, Trash2 } from "lucide-react";
import { DocumentSummary } from "@/types";

interface DeleteDocumentModalProps {
  document: DocumentSummary | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteDocumentModal({
  document,
  deleting,
  onCancel,
  onConfirm,
}: DeleteDocumentModalProps) {
  if (!document) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={() => {
        if (!deleting) onCancel();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 shrink-0">
            <Trash2 size={20} />
          </div>
          <div className="min-w-0">
            <h3
              id="delete-dialog-title"
              className="text-base font-semibold text-zinc-900"
            >
              Delete document?
            </h3>
            <p className="text-xs text-zinc-500 truncate max-w-xs">
              {document.filename}
            </p>
          </div>
        </div>

        <p
          id="delete-dialog-description"
          className="mt-4 text-sm leading-6 text-zinc-600"
        >
          This will permanently delete this document and its associated data.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="
              flex items-center gap-2 rounded-xl
              bg-red-600 px-4 py-2.5 text-xs font-semibold
              text-white transition hover:bg-red-700
              disabled:cursor-not-allowed disabled:opacity-60
            "
          >
            {deleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
