"use client";

/**
 * useChat Hook
 * =============
 * React hook for managing AI chat state and interactions.
 * Provides message history, loading states, and error handling.
 */

import { useState, useCallback, useRef } from "react";
import {
  sendChatMessage,
  type ChatMessage,
  type ChatResponse,
} from "@/lib/api";

interface UseChatOptions {
  /** Additional context to send with each message */
  context?: Record<string, unknown>;
  /** Maximum messages to keep in history */
  maxHistory?: number;
  /** Callback when a response is received */
  onResponse?: (response: ChatResponse) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

interface UseChatReturn {
  /** All messages in the conversation */
  messages: ChatMessage[];
  /** Whether a request is in progress */
  isLoading: boolean;
  /** Last error that occurred */
  error: string | null;
  /** Send a new message */
  sendMessage: (message: string) => Promise<void>;
  /** Clear conversation history */
  clearMessages: () => void;
  /** Last response metadata */
  lastResponse: ChatResponse | null;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { context, maxHistory = 50, onResponse, onError } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      // Cancel any pending request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const userMessage: ChatMessage = {
        role: "user",
        content: message.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendChatMessage({
          message: userMessage.content,
          conversation_history: messages.slice(-maxHistory),
          context,
        });

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.reply,
          timestamp: response.timestamp,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setLastResponse(response);
        onResponse?.(response);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Terjadi kesalahan";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));

        // Add error as assistant message so user can see it
        const errorChatMessage: ChatMessage = {
          role: "assistant",
          content: `⚠️ Error: ${errorMessage}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorChatMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, context, maxHistory, onResponse, onError]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastResponse(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    lastResponse,
  };
}
