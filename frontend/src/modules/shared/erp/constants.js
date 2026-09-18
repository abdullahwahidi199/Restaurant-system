import i18n from "../../../i18n";export const paymentMethods = [
  { value: "cash", label: i18n.t("legacy.cash_758ec54e") },
  { value: "bank_transfer", label: i18n.t("legacy.bank_transfer_17ef50d8") },
  { value: "mobile_money", label: i18n.t("legacy.mobile_money_6a38d1e4") },
  { value: "card", label: i18n.t("legacy.card_4d4ce73b") },
  { value: "other", label: i18n.t("staff.roles.other") },
];

export const inputClass =
  "theme-input h-[38px] w-full px-3 text-[13px] shadow-sm disabled:cursor-not-allowed";

const themeVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const selectTheme = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    backgroundColor: themeVar("--theme-input-bg"),
    borderColor: state.isFocused
      ? themeVar("--theme-input-focus")
      : themeVar("--theme-input-border"),
    boxShadow: state.isFocused
      ? `0 0 0 3px ${themeVar("--theme-input-ring")}, ${themeVar("--theme-shadow-inset")}`
      : themeVar("--theme-shadow-inset"),
    color: themeVar("--theme-text-primary"),
    borderRadius: 8,
    fontSize: 13,
    ":hover": { borderColor: themeVar("--theme-border-strong") },
  }),
  singleValue: (base) => ({ ...base, color: themeVar("--theme-text-primary") }),
  input: (base) => ({ ...base, color: themeVar("--theme-text-primary") }),
  placeholder: (base) => ({ ...base, color: themeVar("--theme-disabled-text") }),
  menu: (base) => ({
    ...base,
    zIndex: 80,
    borderRadius: 8,
    backgroundColor: themeVar("--theme-surface"),
    border: `1px solid ${themeVar("--theme-border")}`,
    boxShadow: themeVar("--theme-shadow-dropdown"),
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? themeVar("--theme-primary")
      : state.isFocused
        ? themeVar("--theme-hover")
        : themeVar("--theme-surface"),
    color: state.isSelected
      ? themeVar("--theme-text-inverse")
      : themeVar("--theme-text-primary"),
    fontSize: 13,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};
