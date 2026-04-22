/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0ff',
          100: '#e0e1ff',
          200: '#c7c8fe',
          300: '#a5a7fd',
          400: '#8082f8',
          500: '#6B7FD4',
          600: '#5a6abf',
          700: '#4a56a8',
          800: '#3d4689',
          900: '#363d70',
        },
        calm: {
          50: '#f0fdf8',
          100: '#ccfbec',
          200: '#99f5d8',
          300: '#5ee9bf',
          400: '#29d4a2',
          500: '#10b989',
          600: '#069870',
          700: '#077a5b',
          800: '#096049',
          900: '#0a4f3d',
        },
        warm: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
};
