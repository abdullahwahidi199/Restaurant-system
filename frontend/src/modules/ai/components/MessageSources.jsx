import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MessageSources({ sources }) {
  const { t } = useTranslation(undefined, { keyPrefix: "aiChat" });
  if (!sources?.length) return null;
  return <div className="message-sources"><strong><BookOpen size={12} aria-hidden="true" /> {t("sources")}</strong>
    <ul>{sources.map((source) => <li key={`${source.document_id}:${source.section_id}`}>
      <bdi>{source.document_title}</bdi>{source.heading && <> — <bdi>{source.heading}</bdi></>}
    </li>)}</ul></div>;
}
