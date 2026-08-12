import { useTranslation } from "react-i18next";

function SectionHeading({
  eyebrowKey,
  titleKey,
  descriptionKey,
  align = "center",
  invert = false,
  className = "",
}) {
  const { t } = useTranslation();
  const alignClass = align === "left" ? "text-left rtl:text-right" : "mx-auto text-center";
  const textColor = invert ? "text-white" : "text-slate-950";
  const descriptionColor = invert ? "text-slate-300" : "text-slate-600";

  return (
    <div className={`landing-reveal max-w-3xl ${alignClass} ${className}`}>
      {eyebrowKey ? (
        <p className="mb-3 text-sm font-semibold uppercase text-emerald-500">
          {t(eyebrowKey)}
        </p>
      ) : null}
      <h2 className={`text-3xl font-bold leading-tight md:text-5xl ${textColor}`}>
        {t(titleKey)}
      </h2>
      {descriptionKey ? (
        <p className={`mt-5 text-base leading-8 md:text-lg ${descriptionColor}`}>
          {t(descriptionKey)}
        </p>
      ) : null}
    </div>
  );
}

export default SectionHeading;
