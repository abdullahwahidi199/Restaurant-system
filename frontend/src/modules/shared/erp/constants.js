export const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

export const inputClass =
  "theme-input w-full px-3 py-2.5 text-sm shadow-sm disabled:cursor-not-allowed";

const themeVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const selectTheme = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    backgroundColor: themeVar("--theme-input-bg"),
    borderColor: state.isFocused
      ? themeVar("--theme-input-focus")
      : themeVar("--theme-input-border"),
    boxShadow: state.isFocused
      ? `0 0 0 4px ${themeVar("--theme-input-ring")}`
      : "none",
    color: themeVar("--theme-text-primary"),
    borderRadius: 8,
    fontSize: 14,
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
    boxShadow: themeVar("--theme-shadow-md"),
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
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};
