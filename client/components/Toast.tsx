"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { ToastItem, ToastType } from "@/types";

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Store recent messages to prevent duplicates
  const recentMessagesRef = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const trimmed = message.trim();
      if (!trimmed) return;

      const now = Date.now();
      const lastShown = recentMessagesRef.current.get(trimmed);
      // Suppress duplicates within 2.5 seconds
      if (lastShown && now - lastShown < 2500) {
        return;
      }
      recentMessagesRef.current.set(trimmed, now);

      // Clean up old entries
      for (const [msg, timestamp] of recentMessagesRef.current.entries()) {
        if (now - timestamp > 5000) {
          recentMessagesRef.current.delete(msg);
        }
      }

      const id = `${now}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, message: trimmed, type };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  const toast = {
    success: useCallback(
      (message: string) => showToast(message, "success"),
      [showToast],
    ),
    error: useCallback(
      (message: string) => showToast(message, "error"),
      [showToast],
    ),
    warning: useCallback(
      (message: string) => showToast(message, "warning"),
      [showToast],
    ),
    info: useCallback(
      (message: string) => showToast(message, "info"),
      [showToast],
    ),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex max-w-sm flex-col gap-2.5 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          let bgClass = "bg-white border-zinc-200 text-zinc-800";
          let icon = <Info className="h-5 w-5 text-blue-500 shrink-0" />;

          if (t.type === "success") {
            bgClass = "bg-white border-emerald-200 text-zinc-800";
            icon = (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            );
          } else if (t.type === "error") {
            bgClass = "bg-white border-red-200 text-zinc-800";
            icon = <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
          } else if (t.type === "warning") {
            bgClass = "bg-white border-amber-200 text-zinc-800";
            icon = (
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            );
          }

          return (
            <div
              key={t.id}
              role={t.type === "error" ? "alert" : "status"}
              className={`
                pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg shadow-zinc-900/5
                transition-all duration-300 ${bgClass}
              `}
            >
              {icon}
              <div className="flex-1 text-xs font-medium leading-5">
                {t.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
                className="text-zinc-400 hover:text-zinc-600 transition p-0.5 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
