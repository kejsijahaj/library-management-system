/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#10231f",
        mineral: "#2f6f63",
        brass: "#c49444",
        chartreuse: "#d6ff5f",
        cinnabar: "#d94f2b",
        blueprint: "#255f9f",
        paper: "#f4ead8",
        parchment: "#dfd0b3",
        soot: "#161a17"
      },
      boxShadow: {
        hard: "8px 8px 0 #10231f",
        glow: "0 24px 70px rgba(16, 35, 31, 0.24)"
      }
    }
  },
  plugins: []
};
