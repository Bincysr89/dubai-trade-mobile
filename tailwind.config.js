/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dt: {
          navy: "#0E1B3D",
          blue: "#1360D2",
          blueLight: "#478CF7",
          bg: "#F8FAFF",
          textDark: "#27314B",
          textMuted: "#7F8A9F",
          textGrey: "#696F83",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
