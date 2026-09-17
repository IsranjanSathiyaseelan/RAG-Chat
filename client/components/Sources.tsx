"use client";

import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { Reference } from "@/types";

interface SourcesProps {
  references: Reference[];
}

export default function Sources({ references }: SourcesProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!references || references.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      {/* Toggle Button / Pill Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center gap-2 rounded-lg border border-zinc-200 
          bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 
          transition-colors hover:bg-zinc-100 hover:text-zinc-900
        "
      >
        <FileText size={14} className="text-zinc-400" />
        <span>
          {references.length} source{references.length !== 1 ? "s" : ""} referenced
        </span>
        <ChevronDown
          size={14}
          className={`text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expandable Content Area */}
      {isOpen && (
        <div className="mt-2.5 space-y-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
          {references.map((reference, index) => (
            <div
              key={reference.chunk_id}
              className="rounded-lg bg-zinc-50 p-3 text-xs border border-zinc-100"
            >
              <div className="flex items-center justify-between font-medium text-zinc-700">
                <span>Source {index + 1}</span>
                <span className="text-[11px] text-zinc-400">
                  Page {reference.page_number}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-3 leading-relaxed text-zinc-500">
                {reference.source_text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}