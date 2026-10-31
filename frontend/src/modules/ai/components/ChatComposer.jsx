import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { INPUT_LIMIT, characterCount } from "../text";
import ModelSelectors from "./ModelSelectors";

export default function ChatComposer({ draft, setDraft, send, disabled, selection, translationKeyPrefix = "aiChat" }) {
  const { t } = useTranslation(undefined, { keyPrefix: translationKeyPrefix });
  const input = useRef(null);
  const count = characterCount(draft);
  useEffect(() => {
    const element = input.current;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
  }, [draft]);
  return <form className="composer" onSubmit={(event) => { event.preventDefault(); send(); }}>
    <ModelSelectors selection={selection} />
    <div className="composer-inner"><textarea ref={input} rows={1} value={draft} dir="auto"
      aria-label={t("messageInput")} placeholder={t("placeholder")} aria-describedby="ai-composer-help"
      onChange={(event) => setDraft(event.target.value)} disabled={disabled}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault(); if (!disabled) send();
        }
      }} />
      <div className="composer-actions"><span className="composer-hint" aria-hidden="true">{t("enterToSend")}</span>
        <button type="submit" className="send-btn" aria-label={t("send")} title={t("send")}
          disabled={disabled || !draft.trim() || count > INPUT_LIMIT}><ArrowUp size={18} aria-hidden="true" /></button>
      </div>
    </div><p id="ai-composer-help" className={`composer-help${count > INPUT_LIMIT ? " input-invalid" : ""}`}>
      <span>{t("inputHelp")}</span><span dir="ltr">{count} / {INPUT_LIMIT}</span>
    </p>
  </form>;
}
