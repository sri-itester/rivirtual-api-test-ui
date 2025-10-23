/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rivGreen: "#2E7D12",
        rivGreenDark: "#1F5A0D",
      },
    },
  },
  plugins: [],
};
