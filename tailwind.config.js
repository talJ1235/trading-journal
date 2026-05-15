/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F0F0F',
        surface: '#1A1A1A',
        'app-border': '#2A2A2A',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A0A0A0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
