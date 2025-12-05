/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
        fontFamily: { 
            sans: ['Inter', 'sans-serif'], 
            mono: ['JetBrains Mono', 'monospace'] 
        },
        colors: { 
            neuro: { 
                bg: '#020617', 
                card: '#0f172a',
                cyan: '#00f0ff', 
                purple: '#7000ff', 
                red: '#ff003c', 
                green: '#00ff9d',
                blue: '#3b82f6' 
            } 
        },
        animation: {
            'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'blob': 'blob 10s infinite',
            'fadeIn': 'fadeIn 0.5s ease-out forwards',
            'slideUp': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        },
        keyframes: {
            blob: {
                '0%': { transform: 'translate(0px, 0px) scale(1)' },
                '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                '100%': { transform: 'translate(0px, 0px) scale(1)' }
            },
            fadeIn: {
                '0%': { opacity: '0', transform: 'translateY(10px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' }
            },
            slideUp: {
                '0%': { transform: 'translateY(100%)' },
                '100%': { transform: 'translateY(0)' }
            }
        }
    },
  },
  plugins: [],
}