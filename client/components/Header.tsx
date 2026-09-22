"use client";

import { DocumentSummary } from "@/types";

interface HeaderProps {
  document: DocumentSummary | null;
  onNewDocument: () => void;
  onDeleteDocument: () => void;
}

export default function Header({
  document,
  onNewDocument,
  onDeleteDocument,
}: HeaderProps) {
  return (
    <header
      className="
        relative z-30
        flex h-20 shrink-0
        items-center justify-between
        border-b border-zinc-200
        bg-white
        px-4 sm:px-8
        pt-14 sm:pt-0
      "
    >
      {/* Document title */}
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-zinc-900 sm:text-lg">
          {document ? document.filename : "Document Intelligence"}
        </h2>
      </div>

      {/* Right-side actions */}
      <div className="flex shrink-0 items-center gap-2">

        {/* Delete current document */}
        {document && (
          <button
            type="button"
            onClick={onDeleteDocument}
            className="
              hidden items-center rounded-lg
              border border-red-200
              bg-white px-3 py-2
              text-sm font-medium text-red-600
              transition-colors
              hover:border-red-300
              hover:bg-red-50
              sm:flex
            "
          >
            Delete
          </button>
        )}
      </div>
    </header>
  );
}
