/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': {
            backgroundPosition: '200% 0',
            opacity: 0.5
          },
          '30%': {
            opacity: 1
          },
          '70%': {
            opacity: 1
          },
          '100%': {
            backgroundPosition: '-200% 0',
            opacity: 0.5
          }
        },
        'neon-pulse': {
          '0%': {
            textShadow: '0 0 4px rgba(139, 92, 246, 0.6), 0 0 12px rgba(139, 92, 246, 0.6), 0 0 16px rgba(139, 92, 246, 0.6), 0 0 24px rgba(139, 92, 246, 0.4)',
            transform: 'scale(1)',
            filter: 'brightness(1)'
          },
          '50%': {
            textShadow: '0 0 4px rgba(139, 92, 246, 0.8), 0 0 12px rgba(139, 92, 246, 0.8), 0 0 16px rgba(139, 92, 246, 0.8), 0 0 24px rgba(139, 92, 246, 0.6), 0 0 36px rgba(139, 92, 246, 0.4)',
            transform: 'scale(1.02)',
            filter: 'brightness(1.2)'
          },
          '100%': {
            textShadow: '0 0 4px rgba(139, 92, 246, 0.6), 0 0 12px rgba(139, 92, 246, 0.6), 0 0 16px rgba(139, 92, 246, 0.6), 0 0 24px rgba(139, 92, 246, 0.4)',
            transform: 'scale(1)',
            filter: 'brightness(1)'
          }
        },
        'icon-pulse': {
          '0%': {
            transform: 'scale(1) rotate(0deg)',
            filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.6))',
            opacity: 0.95
          },
          '50%': {
            transform: 'scale(1.15) rotate(8deg)',
            filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.9)) drop-shadow(0 0 40px rgba(139, 92, 246, 0.5))',
            opacity: 1
          },
          '100%': {
            transform: 'scale(1) rotate(0deg)',
            filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.6))',
            opacity: 0.95
          }
        },
        'float': {
          '0%': {
            transform: 'translateY(0) rotate(0deg)'
          },
          '25%': {
            transform: 'translateY(-4px) rotate(2deg)'
          },
          '75%': {
            transform: 'translateY(2px) rotate(-1deg)'
          },
          '100%': {
            transform: 'translateY(0) rotate(0deg)'
          }
        }
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'icon-pulse': 'icon-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 20%, rgba(255, 255, 255, 0.2) 60%, transparent 100%)',
        'cyber-gradient': 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 25%, #6D28D9 50%, #5B21B6 75%, #4C1D95 100%)',
        'dark-gradient': 'radial-gradient(circle at center, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)'
      }
    },
  },
  plugins: [],
} 