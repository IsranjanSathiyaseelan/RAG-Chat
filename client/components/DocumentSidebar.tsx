"use client";

import Image from "next/image";
import { useState } from "react";
import { SquarePen, FileText, Trash2, Cpu, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (document: DocumentSummary) => {
    onSelect(document);
    setMobileMenuOpen(false);
  };

  const handleNewDocument = () => {
    onNewDocument();
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* =====================================================
          MOBILE TOP BAR
          Fixed so it does NOT take space in the main layout
      ====================================================== */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-[#171717] px-3 text-white shadow-sm md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Image
              src={logo}
              alt="PDF RAG"
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
          </div>

          <h1 className="text-[15px] font-semibold">PDF RAG</h1>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open documents menu"
          aria-expanded={mobileMenuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg
                     text-[#8e8ea0] transition-colors
                     hover:bg-white/10 hover:text-white"
        >
          <Menu size={21} />
        </button>
      </div>

      {/* =====================================================
          MOBILE BACKDROP
      ====================================================== */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close documents menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[280px] flex-col
          bg-[#171717] text-white shadow-2xl
          transition-transform duration-200 ease-out
          md:hidden
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Drawer header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <Image
                src={logo}
                alt="PDF RAG"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
            </div>

            <h1 className="text-[15px] font-semibold">PDF RAG</h1>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg
                       text-[#8e8ea0] transition-colors
                       hover:bg-white/10 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pb-2 pt-2">
          <button
            type="button"
            onClick={handleNewDocument}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                       text-sm text-[#ececec] transition-colors
                       hover:bg-white/10 active:bg-white/5"
          >
            <SquarePen size={15} className="shrink-0 text-[#8e8ea0]" />

            <span className="font-medium">New chat</span>
          </button>
        </div>

        {/* Documents */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:w-0">
          <p className="mb-1 px-2 py-1 text-xs font-medium text-[#8e8ea0]">
            Documents
          </p>

          {documents.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-2 px-4 py-6 text-center">
              <FileText size={28} className="text-[#4d4d4f]" />

              <p className="text-sm text-[#8e8ea0]">No documents yet</p>

              <p className="text-xs text-[#4d4d4f]">
                Upload a PDF to get started
              </p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {documents.map((item) => {
                const isSelected =
                  selectedDocument?.document_id === item.document_id;

                return (
                  <li key={item.document_id}>
                    <div
                      className={`
                        group flex items-center justify-between
                        rounded-lg px-2 py-2
                        transition-colors duration-150
                        ${
                          isSelected
                            ? "bg-white/10 text-white"
                            : "text-[#ececec] hover:bg-white/[0.07]"
                        }
                      `}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      >
                        <FileText
                          size={15}
                          className="shrink-0 text-[#8e8ea0]"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm leading-snug">
                            {item.filename}
                          </p>

                          <p className="text-[11px] text-[#8e8ea0]">
                            {item.pages}p · {item.chunks} chunks
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
                          ml-1 flex h-7 w-7 shrink-0
                          items-center justify-center
                          rounded-md text-[#8e8ea0]
                          transition-all duration-150
                          hover:bg-white/10
                          hover:text-red-400
                          group-hover:opacity-100
                          focus:opacity-100
                        "
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

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.08] p-3">
          <div
            className="
              flex items-center gap-3 rounded-lg
              px-3 py-2.5
              transition-colors duration-150
              hover:bg-white/[0.07]
            "
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
              <Cpu size={14} className="text-emerald-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#ececec]">
                System online
              </p>

              <p className="text-[10px] text-[#8e8ea0]">API connected</p>
            </div>

            <span
              className="
                h-1.5 w-1.5 rounded-full
                bg-emerald-400
                shadow-[0_0_6px_rgba(52,211,153,0.8)]
              "
            />
          </div>

          <p className="mt-2 text-center text-[11px] text-[#4d4d4f]">
            by <span className="text-[#8e8ea0]">isranjan</span>
          </p>
        </div>
      </aside>

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <aside className="hidden w-[260px] shrink-0 flex-col bg-[#171717] text-white md:flex">
        {/* Top bar */}
        <div className="flex h-[60px] shrink-0 items-center justify-between px-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <Image
                src={logo}
                alt="PDF RAG"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
            </div>

            <h1 className="text-[15px] font-semibold">PDF RAG</h1>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={onNewDocument}
            className="
              flex w-full items-center gap-3
              rounded-lg px-3 py-2.5
              text-sm text-[#ececec]
              transition-colors duration-150
              hover:bg-white/10
              active:bg-white/5
            "
          >
            <SquarePen size={15} className="shrink-0 text-[#8e8ea0]" />

            <span className="font-medium">New chat</span>
          </button>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:w-0">
          <p className="mb-1 px-2 py-1 text-xs font-medium text-[#8e8ea0]">
            Documents
          </p>

          {documents.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-2 px-4 py-6 text-center">
              <FileText size={28} className="text-[#4d4d4f]" />

              <p className="text-sm text-[#8e8ea0]">No documents yet</p>

              <p className="text-xs text-[#4d4d4f]">
                Upload a PDF to get started
              </p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {documents.map((item) => {
                const isSelected =
                  selectedDocument?.document_id === item.document_id;

                return (
                  <li key={item.document_id}>
                    <div
                      className={`
                        group flex items-center justify-between
                        rounded-lg px-2 py-2
                        transition-colors duration-150
                        ${
                          isSelected
                            ? "bg-white/10 text-white"
                            : "text-[#ececec] hover:bg-white/[0.07]"
                        }
                      `}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      >
                        <FileText
                          size={15}
                          className="shrink-0 text-[#8e8ea0]"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm leading-snug">
                            {item.filename}
                          </p>

                          <p className="text-[11px] text-[#8e8ea0]">
                            {item.pages}p · {item.chunks} chunks
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
                          ml-1 flex h-6 w-6 shrink-0
                          items-center justify-center
                          rounded-md text-[#8e8ea0]
                          opacity-0 transition-all duration-150
                          hover:bg-white/10
                          hover:text-red-400
                          group-hover:opacity-100
                          focus:opacity-100
                        "
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

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.08] p-3">
          <div
            className="
              flex items-center gap-3 rounded-lg
              px-3 py-2.5
              transition-colors duration-150
              hover:bg-white/[0.07]
            "
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
              <Cpu size={14} className="text-emerald-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#ececec]">
                System online
              </p>

              <p className="text-[10px] text-[#8e8ea0]">API connected</p>
            </div>

            <span
              className="
                h-1.5 w-1.5 rounded-full
                bg-emerald-400
                shadow-[0_0_6px_rgba(52,211,153,0.8)]
              "
            />
          </div>

          <p className="mt-2 text-center text-[11px] text-[#4d4d4f]">
            by <span className="text-[#8e8ea0]">isranjan</span>
          </p>
        </div>
      </aside>
    </>
  );
}
