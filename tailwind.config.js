/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rog: {
          red: '#ff0033',
          darkRed: '#8f001c',
          cyan: '#00f0ff',
          neonPink: '#ff007f',
          accent: '#ff0055',
          bg: '#08080c',
          panel: '#10111a',
          surface: '#181926',
          border: 'rgba(255, 0, 85, 0.25)',
          borderCyan: 'rgba(0, 240, 255, 0.3)',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'scanner': 'scanner 3s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 10px rgba(255, 0, 85, 0.5))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(0, 240, 255, 0.8))' },
        },
        scanner: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
