import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spotlight: {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.8)' },
          '100%': { opacity: '0.15', transform: 'translate(-50%, -50%) scale(1)' },
        },
        "infinite-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(-50% - 2rem))" }, // Adjusts for the gap
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        spotlight: 'spotlight 2s ease-out forwards',
        "infinite-scroll": "infinite-scroll 35s linear infinite",
      }
    },
  },
  plugins: [],
};
export default config;