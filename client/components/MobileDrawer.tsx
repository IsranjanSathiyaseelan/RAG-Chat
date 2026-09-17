"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { SquarePen, X, FileText, Plus, Trash2 } from "lucide-react";
import { DocumentSummary } from "@/types";
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
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 md:hidden"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out"
        style={{ opacity: animateIn ? 1 : 0 }}
      />

      {/* Sidebar Panel — ChatGPT style */}
      <div
        className="absolute left-0 top-0 flex h-full w-[260px] flex-col bg-[#171717] transition-transform duration-300 ease-in-out"
        style={{ transform: animateIn ? "translateX(0)" : "translateX(-100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar: logo + close ── */}
        <div className="flex h-[60px] shrink-0 items-center justify-between px-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <Image src={logo} alt="PDF RAG" width={18} height={18} className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[15px] font-semibold text-white">PDF RAG</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8e8ea0]
                       transition-colors duration-150 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── New Chat button ── */}
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => { onNewDocument(); onClose(); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                       text-sm text-[#ececec] transition-colors duration-150
                       hover:bg-white/10 active:bg-white/5"
          >
            <SquarePen size={16} className="shrink-0 text-[#8e8ea0]" />
            <span className="font-medium">New chat</span>
          </button>
        </div>

        {/* ── Document List ── */}
        <div className="flex-1 overflow-y-auto px-3 pb-4
                        [&::-webkit-scrollbar]:w-0">
          {/* Section label */}
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
                      className={`group flex items-center justify-between rounded-lg px-2 py-2 transition-colors duration-150
                        ${isSelected
                          ? "bg-white/10 text-white"
                          : "text-[#ececec] hover:bg-white/[0.07]"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => { onSelect(item); onClose(); }}
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

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-white/[0.08] px-3 py-3">
          <p className="text-center text-[11px] text-[#4d4d4f]">
            by <span className="text-[#8e8ea0]">isranjan</span>
          </p>
        </div>
      </div>
    </div>
  );
}
