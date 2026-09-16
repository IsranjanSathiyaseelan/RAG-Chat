"use client";

import React from "react";
import { BookOpen, Database, MessageSquare, Sparkles } from "lucide-react";
import PdfUpload from "./PdfUpload";

import { UploadDocumentResponse } from "@/types";

interface EmptyDocumentStateProps {
  onUploaded: (document: UploadDocumentResponse) => void;
}

export default function EmptyDocumentState({
  onUploaded,
}: EmptyDocumentStateProps) {
  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-5 py-12">
        {/* Hero */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100">
            <Sparkles size={30} className="text-violet-600" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
            AI Document Workspace
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Chat with your documents
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
            Upload a PDF and ask questions using retrieval-augmented
            generation. Get grounded answers with references from your
            document.
          </p>
        </div>

        {/* Upload Component */}
        <div className="mt-10 flex w-full justify-center">
          <PdfUpload onUploaded={onUploaded} />
        </div>

        {/* ==================================================
            FREQUENTLY ASKED QUESTIONS / CAPABILITIES CARDS
            ================================================== */}
        <div className="font-poppins mt-14 w-full max-w-4xl text-center">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-800">
            Frequently Asked Questions
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Explore how our intelligent RAG engine processes and analyzes your PDF documents.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {/* Card 1: AI-Powered PDF Chat (Purple Accent) */}
            <div className="rounded-xl border border-purple-100 bg-white p-6 transition-all hover:border-purple-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                <MessageSquare size={22} className="stroke-[1.75]" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                AI-Powered PDF Chat
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ask questions about uploaded PDFs and get intelligent answers.
              </p>
            </div>

            {/* Card 2: Semantic Search (Green Accent) */}
            <div className="rounded-xl border border-emerald-100 bg-white p-6 transition-all hover:border-emerald-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Database size={22} className="stroke-[1.75]" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                Semantic Search
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Find the most relevant information from your documents using AI embeddings and vector search.
              </p>
            </div>

            {/* Card 3: Source References (Orange Accent) */}
            <div className="rounded-xl border border-amber-100 bg-white p-6 transition-all hover:border-amber-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <BookOpen size={22} className="stroke-[1.75]" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                Source References
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                See the relevant page numbers and document sections used to generate each answer.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
