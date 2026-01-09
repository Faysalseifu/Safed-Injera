/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ethiopian-earth': '#4E1815',
        'cloud-white': '#FFFFFF',
        'sefed-sand': '#A89688',
        'injera-maroon': '#5A0F12',
        'coffee-brown': '#4A2A1F',
        'injera-white': '#F9F9F7',
        'accent-gray': '#CFCFCF',
        'amber-glow': '#B56A3A',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

