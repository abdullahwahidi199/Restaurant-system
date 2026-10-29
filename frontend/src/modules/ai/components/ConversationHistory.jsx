import { useEffect, useRef } from "react";
import { History, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConversationHistory({ open, onClose, chat }) {
  const { t } = useTranslation(undefined, { keyPrefix: "aiChat" });
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    panel.current?.querySelector("button")?.focus();
    function keydown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const buttons = [...panel.current.querySelectorAll("button:not(:disabled)")];
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previousFocus?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="history-backdrop" onClick={onClose}>
    <aside ref={panel} className="history-panel" role="dialog" aria-modal="true" aria-label={t("history")}
      onClick={(event) => event.stopPropagation()}>
      <header><h2><History size={17} />{t("history")}</h2>
        <button className="icon-btn" onClick={onClose} aria-label={t("close")}><X size={18} /></button></header>
      <button className="history-new" onClick={() => { chat.startNew(); onClose(); }}><Plus size={16} />{t("newConversation")}</button>
      <div className="history-items" aria-busy={chat.listLoading}>
        {chat.conversations.map((item) => <button key={item.id} className={`history-item${chat.conversationId === item.id ? " selected" : ""}`}
          onClick={() => { chat.openConversation(item.id); onClose(); }}>
          <bdi>{item.title || t("newConversation")}</bdi>
        </button>)}
        {!chat.listLoading && !chat.conversations.length && <p>{t("noConversations")}</p>}
        {chat.listLoading && <p role="status">{t("loading")}</p>}
        {chat.listError && <div className="history-error" role="alert"><p>{t(`errors.${chat.listError}`)}</p>
          <button className="copy-btn" onClick={() => chat.loadConversations(chat.listNext ?? 0)}>{t("reload")}</button></div>}
        {!chat.listLoading && chat.listNext !== null && <button className="history-new" onClick={() => chat.loadConversations(chat.listNext)}>{t("moreConversations")}</button>}
      </div>
    </aside>
  </div>;
}
