/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        weave: { 50: '#faf5ff', 100: '#f3e8ff', 500: '#a855f7', 600: '#9333ea', 900: '#3b0764' },
      },
      fontFamily: { sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
