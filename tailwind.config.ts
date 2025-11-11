import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#FF8C42", // Tangerine（シニア向け明るいオレンジ）
        secondary: "#64748b",
        // シニア向けカラフル配色
        region: {
          '飯田市': '#FF8C42',     // Tangerine
          '南信州': '#FFD700',     // Gold
          '高森町': '#A4D65E',     // Lime
          '松川町': '#40E0D0',     // Turquoise
          '阿智村': '#B19CD9',     // Lavender
          '平谷村': '#FFA07A',     // Peach
          '根羽村': '#D2691E',     // Terracotta
          '下条村': '#FA8072',     // Salmon
          '売木村': '#FFB347',     // Sunflower
          '天龍村': '#20B2AA',     // Teal
          '泰阜村': '#98D8C8',     // Mint
          '喬木村': '#F687B3',     // Rose
          '豊丘村': '#FFBF00',     // Amber
          '大鹿村': '#87CEEB',     // Sky Blue
        },
        accent: {
          coral: '#FF6B6B',        // Coral（NEWバッジ等）
          peach: '#FFA07A',        // Peach
          sunflower: '#FFB347',    // Sunflower
          gold: '#FFD700',         // Gold
          lime: '#A4D65E',         // Lime
          mint: '#98D8C8',         // Mint
          turquoise: '#40E0D0',    // Turquoise
          sky: '#87CEEB',          // Sky Blue
          rose: '#F687B3',         // Rose
          lavender: '#B19CD9',     // Lavender
        },
      },
    },
  },
  plugins: [],
};

export default config;
