"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { DocumentSummary } from "@/types";
import DocumentList from "./DocumentList";
import logo from "../images/logo.svg";

interface MobileDrawerProps {
  open: boolean;
  documents: DocumentSummary[];
  selectedDocument: DocumentSummary | null;
  onClose: () => void;
  onSelect: (document: DocumentSummary) => void;
  onDelete: (document: DocumentSummary) => void;
  onNewDocument: () => void;
}

export default function MobileDrawer({
  open,
  documents,
  selectedDocument,
  onClose,
  onSelect,
  onDelete,
  onNewDocument,
}: MobileDrawerProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex bg-black/60 backdrop-blur-xs md:hidden"
      onClick={onClose}
    >
      <div
        className="flex h-full w-72 flex-col bg-[#18161f] p-4 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl ">
              <Image
                src={logo}
                alt="PDF RAG logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </div>

            <span className="text-sm font-bold">PDF RAG</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Documents */}
        <div className="flex-1 overflow-y-auto">
          <DocumentList
            documents={documents}
            selectedDocument={selectedDocument}
            onSelect={onSelect}
            onDelete={onDelete}
            onNewDocument={onNewDocument}
          />
        </div>
      </div>
    </div>
  );
}
