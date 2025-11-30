// postcss.config.js
// Konfig Tailwind v4 + PostCSS, project kamu pakai "type": "module"

const config = {
  plugins: {
    "@tailwindcss/postcss": {}, // ⬅ pakai package baru, BUKAN "tailwindcss"
  },
};

export default config;
