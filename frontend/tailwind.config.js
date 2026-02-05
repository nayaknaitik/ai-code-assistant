/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        surface: "#0a0a0a",
        border: "#1a1a1a",
        muted: "#737373",
        text: "#fafafa",
        "text-secondary": "#a3a3a3",
        accent: "#3b82f6",
        "accent-hover": "#2563eb",
        danger: "#ef4444",
        success: "#22c55e",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.875rem", { lineHeight: "1.5rem" }],
        lg: ["1rem", { lineHeight: "1.5rem" }],
        xl: ["1.125rem", { lineHeight: "1.75rem" }],
      },
      transitionDuration: {
        150: "150ms",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
