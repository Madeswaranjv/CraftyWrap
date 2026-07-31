import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        peach: {
          50: "#FFF9F4",
          100: "#FDF0E6",
          200: "#F6D9BC",
          300: "#F3CBA3",
          400: "#EEB37E",
          500: "#E59E5D",
          600: "#D48239",
        },
        warmbrown: {
          50: "#FBF7F3",
          100: "#F3E9DF",
          200: "#E4D1BF",
          300: "#D3B59A",
          400: "#C39875",
          500: "#B97D4B",
          600: "#8A5A34",
          700: "#6E4527",
          800: "#5C3A21",
          900: "#3D2412",
        },
        crafty: {
          bg: "#FFFDFA",
          card: "#FFFFFF",
          text: "#5C3A21",
          body: "#6B513E",
          muted: "#967F6E",
          border: "#EEDCD0",
        }
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(138, 90, 52, 0.08)',
        'card': '0 10px 30px -5px rgba(185, 125, 75, 0.1)',
        'hover': '0 20px 35px -10px rgba(138, 90, 52, 0.18)',
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        '4xl': '0px',
        full: '0px',
      }
    },
  },
  plugins: [],
};
export default config;
