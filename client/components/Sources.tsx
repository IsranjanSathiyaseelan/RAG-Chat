"use client";

import { BookOpen, ChevronDown, FileText } from "lucide-react";

import { Reference } from "@/types";

interface SourcesProps {
  references: Reference[];
}

export default function Sources({ references }: SourcesProps) {
  if (!references || references.length === 0) {
    return null;
  }

  return (
    <details className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-zinc-700">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-violet-600" />

          <span>
            {references.length} source
            {references.length !== 1 ? "s" : ""} used
          </span>
        </div>

        <ChevronDown size={16} className="text-zinc-400" />
      </summary>

      <div className="space-y-3 border-t border-zinc-200 p-4">
        {references.map((reference, index) => (
          <div
            key={reference.chunk_id}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                <FileText size={14} className="text-violet-600" />
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-800">
                  Source {index + 1}
                </p>

                <p className="text-xs text-zinc-500">
                  Page {reference.page_number}
                  {" · "}
                  Chunk {reference.chunk_id}
                </p>
              </div>
            </div>

            <p className="mt-3 line-clamp-4 text-xs leading-5 text-zinc-600">
              {reference.source_text}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
