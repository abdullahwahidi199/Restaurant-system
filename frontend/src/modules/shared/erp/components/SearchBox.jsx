import React from "react";
import { Search } from "lucide-react";
import i18n from "../../../../i18n";

export default function SearchBox({ value, onChange, placeholder = i18n.t("legacy.search_bce06414") }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="search"
        className="theme-input h-9 w-full px-3 ps-9 text-[13px]"
        placeholder={placeholder}
      />
    </div>
  );
}
