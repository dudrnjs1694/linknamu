import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "Noto Sans KR",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
