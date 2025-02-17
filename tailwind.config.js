/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2196f3',
        secondary: '#f50057',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'float': 'float 8s ease-in-out infinite',
        'float-delay-2': 'float 8s ease-in-out 2s infinite',
        'float-delay-4': 'float 8s ease-in-out 4s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
