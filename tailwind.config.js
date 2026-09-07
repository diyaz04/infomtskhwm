/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          start: '#16A34A', // green-600
          end: '#22C55E',   // green-500
          hoverStart: '#15803D', // green-700
          hoverEnd: '#16A34A', // green-600
        }
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
