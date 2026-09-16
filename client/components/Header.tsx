"use client";

import React from "react";
import { Menu, Plus, Trash2 } from "lucide-react";
import { DocumentSummary } from "@/types";

interface HeaderProps {
  document: DocumentSummary | null;
  onOpenMobileMenu: () => void;
  onNewDocument: () => void;
  onDeleteDocument: () => void;
}

export default function Header({
  document,
  onOpenMobileMenu,
  onNewDocument,
  onDeleteDocument,
}: HeaderProps) {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-8">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open documents menu"
          className="md:hidden rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-zinc-600">PDF Assistant</span>
          </div>

          <h2 className="mt-1 truncate text-base sm:text-lg font-semibold text-zinc-900">
            {document ? document.filename : "Document Intelligence"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-emerald-700">
            SYSTEM ONLINE
          </span>
        </div>

        {document && (
          <>
            <button
              type="button"
              onClick={onDeleteDocument}
              aria-label="Delete active document"
              className="
                flex items-center gap-2
                rounded-xl border
                border-zinc-200
                bg-white px-3 py-2
                text-xs font-semibold
                text-zinc-700
                transition
                hover:border-red-300
                hover:text-red-600
              "
            >
              <Trash2 size={15} />
              <span className="hidden sm:inline">Delete</span>
            </button>

            <button
              type="button"
              onClick={onNewDocument}
              className="
                flex items-center gap-2
                rounded-xl border
                border-zinc-200
                bg-white px-3 py-2
                text-xs font-semibold
                text-zinc-700
                transition
                hover:border-violet-300
                hover:text-violet-600
              "
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New PDF</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
