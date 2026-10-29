import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { segmentText } from "../text";
import SafeMarkdown from "./SafeMarkdown";
import { RevealContext } from "./revealContext";

export default function TypewriterText({ text, onComplete, onProgress }) {
  const { t } = useTranslation(undefined, { keyPrefix: "aiChat" });
  const total = useMemo(() => segmentText(text).length, [text]);
  const [shown, setShown] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const done = skipped || shown >= total;
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => { if (media.matches) setSkipped(true); };
    finish();
    media.addEventListener("change", finish);
    return () => media.removeEventListener("change", finish);
  }, []);
  useEffect(() => {
    if (done) { onComplete(); return undefined; }
    // Template's ~12 ms/character feel, batched at 25 Hz; long answers <=20s.
    const step = Math.max(3, Math.ceil(total / 500));
    const timer = setInterval(() => setShown((value) => Math.min(total, value + step)), 40);
    return () => clearInterval(timer);
  }, [done, total, onComplete]);
  useEffect(() => { onProgress?.(); }, [shown, onProgress]);
  return <>
    <RevealContext.Provider value={done ? Infinity : shown}><SafeMarkdown text={text} /></RevealContext.Provider>
    {!done && <><span className="typewriter-cursor" aria-hidden="true" />
      <button className="copy-btn skip-animation" onClick={() => setSkipped(true)}>{t("skip")}</button>
      <span className="visually-hidden" role="status">{t("revealing")}</span></>}
  </>;
}
