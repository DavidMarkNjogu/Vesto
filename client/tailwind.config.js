/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // COVERA COLOR SYSTEM
        primary: '#358c9c',
        secondary: '#f68716',
        bg: '#f5f5f5', // The dashboard background
        azure: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    },
  },
  plugins: [require('daisyui')],
  daisyui: { 
    themes: [
      {
        vesto: {
          "primary": "#358c9c",
          "secondary": "#f68716",
          "accent": "#60a5fa",
          "neutral": "#1f2937",
          "base-100": "#ffffff",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
  }
}