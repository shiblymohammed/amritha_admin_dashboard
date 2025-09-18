// _file: admin_dashboard/tailwind.config.js_
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add glowing text effect
      textShadow: {
        glow: '0 0 5px rgba(255,255,255,0.3), 0 0 10px rgba(75, 203, 242, 0.4)',
      },
      // Add floating animation
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        }
      }
    },
  },
  plugins: [
    // Plugin to enable text-shadow utilities
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.text-glow': {
          textShadow: theme('textShadow.glow'),
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
}