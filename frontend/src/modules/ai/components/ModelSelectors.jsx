import { useTranslation } from "react-i18next";

export default function ModelSelectors({ selection }) {
  const { t } = useTranslation(undefined, { keyPrefix: "aiChat" });
  if (!selection) return null;
  if (selection.optionsError) return <p className="model-options-status" role="status" data-state="unavailable">{t("modelOptionsUnavailable")}</p>;
  if (!selection.modelOptions) return selection.optionsLoading ? <p className="model-options-status" role="status">{t("loading")}</p> : null;
  return <div className="model-controls" aria-label={t("modelSettings")}>
    <label className="model-control"><span>{t("model")}</span>
      <select aria-label={t("model")} dir="ltr" value={selection.modelConfiguration.model} onChange={(event) => selection.setModel(event.target.value)}>
        {selection.modelOptions.models.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <label className="model-control"><span>{t("thinkingEffort")}</span>
      <select aria-label={t("thinkingEffort")} dir="ltr" value={selection.modelConfiguration.reasoning_effort} onChange={(event) => selection.setReasoningEffort(event.target.value)}>
        {selection.modelOptions.reasoning_efforts.map((option) => <option key={option.value} value={option.value}>{t(`thinkingLevels.${option.value}`, { defaultValue: option.label })}</option>)}
      </select>
    </label>
  </div>;
}
