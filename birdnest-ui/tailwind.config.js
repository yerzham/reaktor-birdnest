/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',

      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1024px',
        '2xl': '1024px',
      },
    },
  },
  plugins: [],
}