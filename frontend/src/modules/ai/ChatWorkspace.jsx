import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, History, Languages, LogOut, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChatComposer from "./components/ChatComposer";
import ChatMessage from "./components/ChatMessage";
import ConversationHistory from "./components/ConversationHistory";
import ThinkingAnimation from "./components/ThinkingAnimation";
import "./styles/ai-chat.css";
import { getStaffLoginPath } from "../../config/appEnvironment";

// Pure template conversion. The controller is supplied by the API hook in stage B.
export default function ChatWorkspace({ chat, homePath, onLogout }) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: "aiChat" });
  const [historyOpen, setHistoryOpen] = useState(false);
  const scroll = useRef(null);
  const frame = useRef(null);
  const followsBottom = useRef(true);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);
  const scrollBottom = useCallback(() => {
    if (!followsBottom.current || frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const element = scroll.current;
      if (element) element.scrollTop = element.scrollHeight;
    });
  }, []);
  useEffect(() => { followsBottom.current = true; scrollBottom(); }, [chat.conversationId, scrollBottom]);
  useEffect(() => { if (chat.sending) { followsBottom.current = true; scrollBottom(); } }, [chat.sending, scrollBottom]);
  useEffect(() => { scrollBottom(); }, [chat.messages, chat.sending, chat.loading, chat.animatingId, scrollBottom]);
  useEffect(() => () => { cancelAnimationFrame(frame.current); frame.current = null; }, []);
  const finishAnimation = chat.finishAnimation;
  const welcome = !chat.messages.length && !chat.loading;
  const suggestions = ["order", "payment", "reservation", "permissions"];
  return <section className="pakhlai-ai" dir={i18n.dir()} lang={i18n.resolvedLanguage}>
    <div className="app-shell">
      <header className="page-header"><div className="page-header-left">
        <Link className="icon-btn" to={homePath} aria-label={t("back")} title={t("back")}><ArrowLeft size={18} /></Link>
        <div className="brand-mark" aria-hidden="true">PK</div>
        <div className="page-title-group"><h1>{t("title")}</h1><p>{t("subtitle")}</p></div>
      </div><div className="header-actions">
        <span className="status-pill"><BookOpen size={12} aria-hidden="true" />{t("documentationOnly")}</span>
        {onLogout && <button className="icon-btn" onClick={onLogout} aria-label={t("auth.logout", { keyPrefix: "", defaultValue: "Logout" })} title={t("auth.logout", { keyPrefix: "", defaultValue: "Logout" })}><LogOut size={17} /></button>}
        <label className="language-control"><Languages size={15} aria-hidden="true" /><span className="visually-hidden">{t("language")}</span>
          <select aria-label={t("language")} value={(i18n.resolvedLanguage || "en").split("-")[0]} onChange={(event) => i18n.changeLanguage(event.target.value)}>
            <option value="en">English</option><option value="fa">دری</option><option value="ps">پښتو</option>
          </select>
        </label>
      </div></header>
      <main className="chat-card" aria-label={t("interface")}>
        <div className="chat-card-header"><div className="chat-card-header-left">
          <div className="chat-avatar" aria-hidden="true"><Sparkles size={18} /></div><div className="chat-heading">
            <div className="chat-title">{chat.title || t("newConversation")}</div>
            <div className="chat-subtitle">{t(chat.conversationId ? "saved" : "startHint")}</div>
          </div>
        </div><div className="chat-card-header-right">
          <button className="icon-btn" onClick={() => { chat.loadConversations?.(); setHistoryOpen(true); }} aria-label={t("history")} title={t("history")}><History size={17} /></button>
          <button className="icon-btn" onClick={chat.startNew} aria-label={t("newConversation")} title={t("newConversation")}><Plus size={18} /></button>
        </div></div>
        <div className="messages-scroll" ref={scroll} aria-label={t("messages")} onScroll={() => {
          const element = scroll.current;
          followsBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
        }}>
          {chat.loading && <p role="status">{t("loading")}</p>}
          {welcome && <div className="welcome"><div className="welcome-icon" aria-hidden="true"><Sparkles size={26} /></div>
            <h2>{t("welcome")}</h2><p>{t("welcomeHelp")}</p><div className="suggestion-grid">
              {suggestions.map((key) => <button className="suggestion-card" key={key} onClick={() => chat.setDraft(t(`suggestions.${key}`))}>
                <BookOpen size={15} aria-hidden="true" /><span>{t(`suggestions.${key}`)}</span></button>)}
            </div></div>}
          {chat.messages.map((message) => <ChatMessage key={message.id} message={message} animate={chat.animatingId === message.id}
            onComplete={finishAnimation} onProgress={scrollBottom} />)}
          {chat.sending && <ThinkingAnimation />}
          {chat.historyNext !== null && !chat.loading && <button className="history-new" disabled={chat.sending} onClick={chat.loadMoreMessages}>{t("moreMessages")}</button>}
          {chat.error && <div className="system-banner" role="alert"><div><strong>{t("requestFailed")}</strong><p>{t(`errors.${chat.error}`)}</p>
            {chat.failedQuestion && <p>{t("questionKept")}</p>}
            {chat.conversationId && <button className="copy-btn" disabled={chat.sending} onClick={chat.reloadConversation}>{t("reload")}</button>}
          </div></div>}
        </div>
        <ChatComposer draft={chat.draft} setDraft={chat.setDraft} send={chat.send}
          selection={chat.selection}
          disabled={chat.sending || chat.loading || !!chat.animatingId || chat.historyNext !== null || chat.historyIncomplete || chat.selection?.optionsLoading} />
      </main>
      {(chat.error === "authentication" || chat.listError === "authentication") && <Link className="history-new" to={getStaffLoginPath()}>{t("signIn")}</Link>}
    </div><ConversationHistory open={historyOpen} onClose={closeHistory} chat={chat} />
  </section>;
}
