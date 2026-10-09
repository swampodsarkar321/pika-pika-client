/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: { xl: '0.9rem', '2xl': '1.25rem' },
      boxShadow: { card: '0 1px 3px rgba(16,24,40,.08), 0 1px 2px rgba(16,24,40,.06)' },
    },
  },
  plugins: [],
};
