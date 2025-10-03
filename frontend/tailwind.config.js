// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
   safelist: [
    'bg-blue-900',
    'opacity-0',
    'min-w-full',
    'px-4', 
    'pb-6',
    'py-6',
    // add all utility classes your invoice needs
  ],
  variants: {
    extend: {},
  },
  plugins: [],
}
