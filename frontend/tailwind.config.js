/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 鸟居红/朱砂红 - 主色调
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#D9333F',  // 鸟居红
          600: '#c41e2a',
          700: '#a51b24',
          800: '#87171d',
          900: '#6b1419',
        },
        // 纸张色/米白背景
        paper: {
          50: '#FEFDFB',
          100: '#FAF8F5',
          200: '#F5F5F5',
          300: '#EDEBE8',
          400: '#E0DCD6',
          500: '#D4CFC7',
        },
        // 墨黑文字色
        ink: {
          50: '#f8f8f7',
          100: '#e8e7e5',
          200: '#d1cfcc',
          300: '#a9a5a0',
          400: '#7a7167',
          500: '#5c544a',
          600: '#4a433b',
          700: '#3d372f',
          800: '#2C2C2C',  // 墨黑主文字
          900: '#1a1916',
        },
      },
      fontFamily: {
        sans: ['HarmonyOS Sans SC', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      borderRadius: {
        'card': '3px',  // 微圆角，符卡风格
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(217, 51, 63, 0.12)',
      },
    },
  },
  plugins: [],
}
