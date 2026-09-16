"use client";

import React from "react";
import { BookOpen, FileText, Trash2 } from "lucide-react";
import { DocumentSummary } from "@/types";

interface DocumentListProps {
  documents: DocumentSummary[];
  selectedDocument: DocumentSummary | null;
  onSelect: (document: DocumentSummary) => void;
  onDelete: (document: DocumentSummary) => void;
  onNewDocument: () => void;
}

export default function DocumentList({
  documents,
  selectedDocument,
  onSelect,
  onDelete,
  onNewDocument,
}: DocumentListProps) {
  return (
    <>
      {/* Workspace button */}
      <button
        type="button"
        onClick={onNewDocument}
        className="
          w-full rounded-xl
          bg-white/8 px-3 py-3
          text-left transition
          hover:bg-white/10
        "
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600/20">
            <BookOpen size={17} className="text-violet-400" />
          </div>

          <div>
            <p className="text-sm font-medium">PDF Assistant</p>
            <p className="text-[11px] text-white/40">Document Q&A</p>
          </div>
        </div>
      </button>

      {/* Documents */}
      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Documents
          </p>
          <span className="text-[10px] text-white/30">{documents.length}</span>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-3 py-5 text-center">
            <FileText size={18} className="mx-auto text-white/20" />
            <p className="mt-2 text-[11px] text-white/30">No documents yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((item) => {
              const isSelected =
                selectedDocument?.document_id === item.document_id;

              return (
                <div
                  key={item.document_id}
                  className={`
                    group flex items-center justify-between rounded-xl border p-2.5 transition
                    ${
                      isSelected
                        ? "border-violet-500/40 bg-violet-500/15"
                        : "border-transparent bg-white/5 hover:bg-white/8"
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div
                      className={`
                        flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                        ${isSelected ? "bg-violet-500/20" : "bg-white/5"}
                      `}
                    >
                      <FileText
                        size={16}
                        className={
                          isSelected ? "text-violet-400" : "text-white/40"
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white/90">
                        {item.filename}
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/35">
                        {item.pages} pages · {item.chunks} chunks
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item);
                    }}
                    aria-label={`Delete ${item.filename}`}
                    className="
                      ml-2 rounded-lg p-2 text-white/30 transition
                      hover:bg-red-500/20 hover:text-red-400
                      focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-red-400
                    "
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
