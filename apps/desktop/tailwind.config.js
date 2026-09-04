const path = require("path");

/** Torki Bazar brand palette: modern green, soft backgrounds, clear states. */
module.exports = {
  content: [
    path.resolve(__dirname, "src/renderer/index.html"),
    path.resolve(__dirname, "src/renderer/src/**/*.{ts,tsx}"),
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf3",
          100: "#d6f5e2",
          200: "#aeebc7",
          300: "#7ddba7",
          400: "#4bc686",
          500: "#27a86a",
          600: "#1c8a56",
          700: "#186f47",
          800: "#16583a",
          900: "#134831",
        },
      },
    },
  },
  plugins: [],
};
