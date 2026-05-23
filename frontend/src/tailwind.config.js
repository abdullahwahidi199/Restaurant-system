module.exports = {
  plugins: [require("@tailwindcss/aspect-ratio"), require("tailwindcss-rtl")],
  theme: {
    extend: {
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      fontSize: {
        kitchen: ["3rem", "1"],
      },
    },
  },
};
