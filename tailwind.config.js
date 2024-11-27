/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          'blink-3x': 'blink 0.5s ease-in-out 3',
        },
        keyframes: {
          blink: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
          }
        }
      },
    },
    plugins: [],
  }