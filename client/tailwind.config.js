import typography from '@tailwindcss/typography'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'ui-sans-serif', 'Arial']
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.06)'
      },
      colors: {
        border: 'hsl(var(--color-border))'
      }
    },
  },
  plugins: [typography]
}

