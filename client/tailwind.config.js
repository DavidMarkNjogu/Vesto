/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#358c9c',
        secondary: '#f68716',
        bg: '#f5f5f5'
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    },
  },
  plugins: [require('daisyui')],
  daisyui: { themes: ['light'] }
}

