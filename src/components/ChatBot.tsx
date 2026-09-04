"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/use-locale";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Full-screen chat experience for "Nomi", the recipe assistant experiment
 * (src/app/experiments/chatbot). Talks to the /api/chat serverless
 * function (api/chat.mts, deployed separately from this statically exported
 * app — see docs/architecture.md) which runs the OpenAI Agents SDK, or
 * returns a mocked reply until an API key is configured.
 */
export function ChatBot() {
  const { locale, t } = useLocale();
  // Not seeded with a greeting message: the greeting is rendered straight
  // from `t` below instead (see the empty-state bubble in the JSX) so it
  // stays in sync if the detected locale changes right after hydration —
  // storing translated text in state up front would freeze it in whatever
  // language was current at that first render. It's also not real
  // conversation history, so leaving it out of `messages` keeps it out of
  // what gets sent to /api/chat.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(false);
    setSending(true);

    try {
      // Trailing slash to match next.config.ts's trailingSlash: true and
      // avoid an extra 308 redirect hop (Vercel's routing applies that
      // redirect to every path on this deployment, this Vercel Function
      // included, not just Next's own pages).
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: nextMessages, locale }),
      });
      if (!res.ok) throw new Error(`chat request failed: ${res.status}`);
      const data = (await res.json()) as { reply?: string };
      if (!data.reply) throw new Error("empty reply");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="chatbot">
      <div className="chatbot__top">
        <span className="chatbot__title">💬 {t.experiments.chatbot.title}</span>
        {/* Plain <a>: see RecipeCard.tsx for why this app avoids next/link. */}
        <a href="/experiments/" className="btn btn-icon" aria-label={t.experiments.chatbot.close}>
          ✕
        </a>
      </div>

      <div className="chatbot__body">
        {messages.length === 0 && (
          <div className="chatbot__bubble chatbot__bubble--assistant">{t.experiments.chatbot.greeting}</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chatbot__bubble chatbot__bubble--${m.role}`}>
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="chatbot__bubble chatbot__bubble--assistant chatbot__bubble--thinking">
            {t.experiments.chatbot.thinking}
          </div>
        )}
        {error && <div className="chatbot__error">{t.experiments.chatbot.error}</div>}
        <div ref={bottomRef} />
      </div>

      <form
        className="chatbot__composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          className="chatbot__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.experiments.chatbot.inputPlaceholder}
          rows={1}
          disabled={sending}
        />
        <button
          type="submit"
          className="btn btn-primary chatbot__send"
          disabled={sending || !input.trim()}
          aria-label={t.experiments.chatbot.send}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
