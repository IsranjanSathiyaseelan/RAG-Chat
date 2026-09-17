"use client";

import React from "react";
import Image from "next/image";
import { SquarePen, FileText, Trash2, Cpu } from "lucide-react";
import { DocumentSummary } from "@/types";
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
    <aside className="hidden w-[260px] shrink-0 flex-col bg-[#171717] text-white md:flex">

      {/* ── Top bar: logo + new chat icon ── */}
      <div className="flex h-[60px] shrink-0 items-center justify-between px-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Image src={logo} alt="PDF RAG" width={18} height={18} className="h-[18px] w-[18px]" />
          </div>
          <h1 className="text-[15px] font-semibold text-white">PDF RAG</h1>
        </div>

        <button
          type="button"
          onClick={onNewDocument}
          aria-label="New chat"
          title="New chat"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8e8ea0]
                     transition-colors duration-150 hover:bg-white/10 hover:text-white"
        >
          <SquarePen size={18} />
        </button>
      </div>

      {/* ── New Chat row (text button) ── */}
      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onNewDocument}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                     text-sm text-[#ececec] transition-colors duration-150
                     hover:bg-white/10 active:bg-white/5"
        >
          <SquarePen size={15} className="shrink-0 text-[#8e8ea0]" />
          <span className="font-medium">New chat</span>
        </button>
      </div>

      {/* ── Document list ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-4
                      [&::-webkit-scrollbar]:w-0">
        <p className="mb-1 px-2 py-1 text-xs font-medium text-[#8e8ea0]">
          Documents
        </p>

        {documents.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 px-4 py-6 text-center">
            <FileText size={28} className="text-[#4d4d4f]" />
            <p className="text-sm text-[#8e8ea0]">No documents yet</p>
            <p className="text-xs text-[#4d4d4f]">Upload a PDF to get started</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {documents.map((item) => {
              const isSelected = selectedDocument?.document_id === item.document_id;
              return (
                <li key={item.document_id}>
                  <div
                    className={`group flex items-center justify-between rounded-lg px-2 py-2
                                transition-colors duration-150
                                ${isSelected
                                  ? "bg-white/10 text-white"
                                  : "text-[#ececec] hover:bg-white/[0.07]"
                                }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <FileText size={15} className="shrink-0 text-[#8e8ea0]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm leading-snug">{item.filename}</p>
                        <p className="text-[11px] text-[#8e8ea0]">
                          {item.pages}p · {item.chunks} chunks
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                      aria-label={`Delete ${item.filename}`}
                      className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md
                                 text-[#8e8ea0] opacity-0 transition-all duration-150
                                 hover:bg-white/10 hover:text-red-400
                                 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Footer: system status + attribution ── */}
      <div className="shrink-0 border-t border-white/[0.08] p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5
                        transition-colors duration-150 hover:bg-white/[0.07]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
            <Cpu size={14} className="text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#ececec]">System online</p>
            <p className="text-[10px] text-[#8e8ea0]">API connected</p>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        </div>
        <p className="mt-2 text-center text-[11px] text-[#4d4d4f]">
          by <span className="text-[#8e8ea0]">isranjan</span>
        </p>
      </div>
    </aside>
  );
}

