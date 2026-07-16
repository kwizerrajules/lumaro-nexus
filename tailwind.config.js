/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        brand: {
          amber: '#d97706',
          'amber-hover': '#b45309',
          soft: '#fbbf24',
          black: '#0a0a0a',
          ink: '#171717',
          muted: '#525252',
          surface: '#fafaf9',
          line: '#e7e5e4',
        },
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'ui-sans-serif', 'sans-serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      boxShadow: {
        brand: '0 20px 50px -24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
