"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import {
  AlertCircle,
  ArrowUp,
  Bot,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { askQuestion, getChatHistory } from "@/lib/api";

import { ChatMessage } from "@/types";

import { useToast } from "@/components/Toast";
import Message from "./Message";

interface ChatProps {
  documentId: number;
}

const suggestions = [
  "What is this document about?",
  "Summarize the main points.",
  "What are the key conclusions?",
  "Explain the most important section.",
];

export default function Chat({ documentId }: ChatProps) {
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [error, setError] = useState("");

  const activeDocRef = useRef(documentId);
  activeDocRef.current = documentId;

  // --------------------------------------------------
  // Load previous conversations for this document
  // --------------------------------------------------
  const loadHistory = async (targetDocId: number) => {
    setLoadingHistory(true);
    setHistoryError("");
    setMessages([]);

    try {
      const history = await getChatHistory(targetDocId);

      // Prevent race conditions when switching documents quickly
      if (activeDocRef.current !== targetDocId) {
        return;
      }

      const formattedMessages: ChatMessage[] = [];
      for (const item of history) {
        formattedMessages.push({
          id: `user-${item.id}`,
          role: "user",
          content: item.question,
        });
        formattedMessages.push({
          id: `assistant-${item.id}`,
          role: "assistant",
          content: item.answer,
        });
      }

      setMessages(formattedMessages);
    } catch (err: unknown) {
      if (activeDocRef.current !== targetDocId) {
        return;
      }
      let msg = "Unable to load previous chats for this document.";
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorData = (err as { response?: { data?: { detail?: string } } })
          .response?.data;
        if (typeof errorData?.detail === "string") {
          msg = errorData.detail;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setHistoryError(msg);
      toast.error(msg);
    } finally {
      if (activeDocRef.current === targetDocId) {
        setLoadingHistory(false);
      }
    }
  };

  useEffect(() => {
    loadHistory(documentId);
  }, [documentId]);

  // --------------------------------------------------
  // Send question
  // --------------------------------------------------
  const sendQuestion = async (text?: string) => {
    const finalQuestion = (text ?? question).trim();

    if (!finalQuestion) {
      toast.warning("Please enter a question.");
      return;
    }

    if (loading || loadingHistory) {
      return;
    }

    setError("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: finalQuestion,
    };

    setMessages((previous) => [...previous, userMessage]);
    setQuestion("");
    setLoading(true);
    toast.info("Question submitted...");

    try {
      const response = await askQuestion({
        document_id: documentId,
        question: finalQuestion,
        top_k: 5,
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        references: response.references,
        usage: response.usage,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (err: unknown) {
      let message = "Something went wrong while generating the answer.";
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorData = (err as { response?: { data?: { detail?: string } } })
          .response?.data;
        if (typeof errorData?.detail === "string") {
          message = errorData.detail;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuestion();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto w-full max-w-4xl">
          {loadingHistory ? (
            /* Loading previous chats */
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Loader2 size={24} className="animate-spin" />
              </div>
              <p className="mt-4 text-sm font-semibold text-zinc-800">
                Loading previous conversations...
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Retrieving message history for this document
              </p>
            </div>
          ) : historyError ? (
            /* History Error state */
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertCircle size={24} />
              </div>
              <p className="mt-4 text-sm font-semibold text-zinc-800">
                Failed to load conversation history
              </p>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                {historyError}
              </p>
              <button
                type="button"
                onClick={() => loadHistory(documentId)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            /* Empty chat state */
            <div className="flex min-h-[55vh] items-center justify-center">
              <div className="w-full max-w-2xl text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                  <Bot size={28} className="text-violet-600" />
                </div>

                <h2 className="mt-5 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                  No previous conversations for this document.
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
                  Ask a question and I’ll retrieve the most relevant parts of
                  your document before generating an answer.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendQuestion(suggestion)}
                      className="
                        rounded-2xl border
                        border-zinc-200 bg-white
                        p-4 text-left text-sm
                        text-zinc-700
                        shadow-sm
                        transition
                        hover:border-violet-300
                        hover:bg-violet-50/50
                      "
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Sparkles size={15} className="text-violet-500" />
                        <span className="font-medium">Suggested question</span>
                      </div>
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active message list */
            <div className="space-y-6">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                    <Bot size={18} className="text-violet-600" />
                  </div>

                  <div className="rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 animate-pulse-dot rounded-full bg-violet-500" />
                      <span
                        className="h-2 w-2 animate-pulse-dot rounded-full bg-violet-500"
                        style={{
                          animationDelay: "0.2s",
                        }}
                      />
                      <span
                        className="h-2 w-2 animate-pulse-dot rounded-full bg-violet-500"
                        style={{
                          animationDelay: "0.4s",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-auto mb-3 w-full max-w-4xl px-4 sm:px-8">
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="border-t border-zinc-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="flex items-end gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendQuestion();
                }
              }}
              disabled={loading || loadingHistory}
              rows={1}
              placeholder={
                loadingHistory
                  ? "Loading chat history..."
                  : "Ask a question about your document..."
              }
              className="
                max-h-32 min-h-12
                flex-1 resize-none
                bg-transparent
                px-3 py-3
                text-sm text-zinc-900
                outline-none
                placeholder:text-zinc-400
                disabled:opacity-50
              "
            />

            <button
              type="submit"
              disabled={loading || loadingHistory || !question.trim()}
              aria-label="Send question"
              className="
                flex h-11 w-11
                shrink-0 items-center
                justify-center rounded-xl
                bg-violet-600
                text-white
                transition
                hover:bg-violet-700
                disabled:cursor-not-allowed
                disabled:bg-zinc-300
              "
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowUp size={19} />
              )}
            </button>
          </div>

          <p className="mt-2 text-center text-[11px] text-zinc-400">
            AI answers are generated from the retrieved content of your uploaded
            document.
          </p>
        </form>
      </div>
    </div>
  );
}
