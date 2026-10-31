/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        lime: { DEFAULT: '#C6FF3D', 400: '#C6FF3D', 500: '#A8F000' },
        cyan: { DEFAULT: '#22E4FF', 400: '#22E4FF', 500: '#00C8F0' },
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgb(var(--accent) / 0.55)',
        'glow-sm': '0 0 20px -6px rgb(var(--accent) / 0.6)',
        card: '0 10px 40px -12px rgb(0 0 0 / 0.45)',
      },
      keyframes: {
        pulseLine: {
          '0%': { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        wave: {
          '0%,100%': { transform: 'rotate(0deg)' },
          '20%,60%': { transform: 'rotate(18deg)' },
          '40%,80%': { transform: 'rotate(-10deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        pulseLine: 'pulseLine 2.4s linear infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
