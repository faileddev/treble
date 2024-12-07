/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Scans all files in the `app` directory
    './components/**/*.{js,ts,jsx,tsx}', // Scans all files in the `components` directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
