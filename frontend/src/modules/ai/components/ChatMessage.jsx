import { memo, useEffect, useRef, useState } from "react";
import { Bot, Check, Copy, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import SafeMarkdown from "./SafeMarkdown";
import TypewriterText from "./TypewriterText";
import MessageSources from "./MessageSources";

const ChatMessage = memo(function ChatMessage({ message, animate, onComplete, onProgress }) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: "aiChat" });
  const [copyState, setCopyState] = useState("");
  const timer = useRef();
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(timer.current); }; }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(message.content); if (mounted.current) setCopyState("copied"); }
    catch { if (mounted.current) setCopyState("copyFailed"); }
    if (mounted.current) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopyState(""), 1500);
    }
  }
  const user = message.role === "user";
  const date = new Date(message.created_at);
  const time = Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" });
  return <article className={`message-row ${user ? "user" : "assistant"}${message.historical ? " historical" : ""}`}
    aria-label={t(user ? "you" : "assistant")} data-message-id={message.id}>
    <div className="message-avatar" aria-hidden="true">{user ? <UserRound size={14} /> : <Bot size={15} />}</div>
    <div className="message-body">
      <div className="message-bubble" dir="auto">{user ? message.content : animate
        ? <TypewriterText text={message.content} onComplete={onComplete} onProgress={onProgress} />
        : <SafeMarkdown text={message.content} />}</div>
      {!animate && <MessageSources sources={message.sources} />}
      <div className="message-meta"><time dateTime={message.created_at}>{time}</time>
        <button className="copy-btn" onClick={copy} aria-label={t("copy")}>
          {copyState === "copied" ? <Check size={12} /> : <Copy size={12} />}<span>{t(copyState || "copy")}</span>
        </button>{message.state !== "complete" && <span>{t(message.state === "pending" ? "pending" : "failed")}</span>}
      </div>
    </div>
  </article>;
});
export default ChatMessage;
