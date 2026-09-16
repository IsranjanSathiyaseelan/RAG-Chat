"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { DocumentSummary } from "@/types";
import DocumentList from "./DocumentList";
import logo from "../images/logo.svg";

interface DocumentSidebarProps {
  documents: DocumentSummary[];
  selectedDocument: DocumentSummary | null;
  onSelect: (document: DocumentSummary) => void;
  onDelete: (document: DocumentSummary) => void;
  onNewDocument: () => void;
}

export default function DocumentSidebar({
  documents,
  selectedDocument,
  onSelect,
  onDelete,
  onNewDocument,
}: DocumentSidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col bg-[#18161f] text-white md:flex">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl ">
          <Image
            src={logo}
            alt="PDF RAG logo"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </div>

        <div>
          <h1 className="text-sm font-bold tracking-wide">PDF RAG</h1>
          <p className="text-[11px] text-white/40">
            Intelligent workspace
          </p>
        </div>
      </div>

      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
          Workspace
        </p>

        <DocumentList
          documents={documents}
          selectedDocument={selectedDocument}
          onSelect={onSelect}
          onDelete={onDelete}
          onNewDocument={onNewDocument}
        />
      </div>

      {/* System status */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <ShieldCheck
              size={16}
              className="text-emerald-400"
            />
          </div>

          <div>
            <p className="text-xs font-medium">System online</p>
            <p className="text-[10px] text-white/35">
              API connected
            </p>
          </div>

          <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
        </div>
      </div>
    </aside>
  );
}
