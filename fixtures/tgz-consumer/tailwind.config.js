/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@dify-chat/widget/dist/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'theme-text': 'var(--theme-text-color)',
        'theme-desc': 'var(--theme-desc-color)',
        'theme-bg': 'var(--theme-bg-color)',
        'theme-main-bg': 'var(--theme-main-bg-color)',
        'theme-btn-bg': 'var(--theme-btn-bg-color)',
        'theme-border': 'var(--theme-border-color)',
        'theme-splitter': 'var(--theme-splitter-color)',
        'theme-button-border': 'var(--theme-button-border-color)',
        'theme-success': 'var(--theme-success-color)',
        'theme-warning': 'var(--theme-warning-color)',
        'theme-danger': 'var(--theme-danger-color)',
        'theme-code-block-bg': 'var(--theme-code-block-bg-color)',
      },
    },
  },
  darkMode: 'selector',
  plugins: [],
}
