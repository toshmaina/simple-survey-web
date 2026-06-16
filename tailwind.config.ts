/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: '#111827',
        muted: '#6B7280',
        border: '#E5E7EB',
        surface: '#F9FAFB',
        accent: '#2563EB',
        'accent-light': '#EFF6FF',
        danger: '#DC2626',
        'danger-light': '#FEF2F2',
        success: '#16A34A',
        'success-light': '#F0FDF4',
      },
    },
  },
  plugins: [],
}
