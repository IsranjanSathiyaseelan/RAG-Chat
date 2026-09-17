"use client";

import React from "react";
import { Menu, Plus, Trash2 } from "lucide-react";
import { DocumentSummary } from "@/types";

interface HeaderProps {
  document: DocumentSummary | null;
  mobileMenuOpen?: boolean;
  onOpenMobileMenu: () => void;
  onNewDocument: () => void;
  onDeleteDocument: () => void;
}

export default function Header({
  document,
  mobileMenuOpen = false,
  onOpenMobileMenu,
  onNewDocument,
  onDeleteDocument,
}: HeaderProps) {
  return (
    <header className="relative z-50 flex h-20 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-8">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label={
            mobileMenuOpen ? "Close documents menu" : "Open documents menu"
          }
          aria-expanded={mobileMenuOpen}
          className={`
            md:hidden relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300
            ${
              mobileMenuOpen
                ? "border-zinc-800 bg-zinc-900 text-white shadow-xs"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
            }
          `}
        >
          <div className="relative flex h-4 w-[18px] items-center justify-center">
            {/* Top bar */}
            <span
              className={`
                absolute h-0.5 w-[18px] rounded-full bg-current transition-all duration-300 ease-in-out
                ${
                  mobileMenuOpen
                    ? "translate-y-0 rotate-45"
                    : "-translate-y-1.5"
                }
              `}
            />
            {/* Middle bar */}
            <span
              className={`
                absolute h-0.5 w-[18px] rounded-full bg-current transition-all duration-300 ease-in-out
                ${
                  mobileMenuOpen
                    ? "scale-x-0 opacity-0"
                    : "translate-y-0 opacity-100"
                }
              `}
            />
            {/* Bottom bar */}
            <span
              className={`
                absolute h-0.5 w-[18px] rounded-full bg-current transition-all duration-300 ease-in-out
                ${
                  mobileMenuOpen
                    ? "translate-y-0 -rotate-45"
                    : "translate-y-1.5"
                }
              `}
            />
          </div>
        </button>

        <div className="min-w-0">
          <h2 className="mt truncate text-base sm:text-lg font-semibold text-zinc-900">
            {document ? document.filename : "Document Intelligence"}
          </h2>
        </div>
      </div>
    </header>
  );
}
