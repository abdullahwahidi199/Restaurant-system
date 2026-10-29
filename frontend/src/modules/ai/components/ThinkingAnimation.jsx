import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ThinkingAnimation() {
  const { t } = useTranslation(undefined, { keyPrefix: "aiChat" });
  return <div className="thinking-row" role="status" aria-live="polite">
    <div className="message-avatar" aria-hidden="true"><Bot size={15} /></div>
    <div className="thinking-bubble"><div className="thinking-dots" aria-hidden="true"><span /><span /><span /></div>
      <div className="thinking-label"><span className="phase">{t("thinking")}</span></div></div>
  </div>;
}
