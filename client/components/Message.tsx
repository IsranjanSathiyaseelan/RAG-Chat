"use client";

import { Bot, User } from "lucide-react";

import { ChatMessage } from "@/types";

import Sources from "./Sources";

interface MessageProps {
  message: ChatMessage;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`
        flex gap-3
        ${isUser ? "justify-end" : "justify-start"}
      `}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100">
          <Bot size={18} className="text-violet-600" />
        </div>
      )}

      <div className="max-w-[85%]">
        <div
          className={`
            rounded-2xl px-4 py-3
            ${
              isUser
                ? "rounded-br-md bg-zinc-900 text-white"
                : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800 shadow-sm"
            }
          `}
        >
          <p className="whitespace-pre-wrap text-sm leading-6">
            {message.content}
          </p>
        </div>

        {!isUser && message.references && message.references.length > 0 && (
          <Sources references={message.references} />
        )}

        {!isUser && message.usage?.total_tokens && (
          <p className="mt-2 text-xs text-zinc-400">
            {message.usage.total_tokens} tokens
          </p>
        )}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-200">
          <User size={18} className="text-zinc-600" />
        </div>
      )}
    </div>
  );
}
