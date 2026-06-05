import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ["var(--font-bebas-neue)", "sans-serif"],
      },
      colors: {
        f7: {
          bg: "#0a0e1a",
          accent: "#00e5a0",
        },
      },
    },
  },
  plugins: [],
};

export default config;
