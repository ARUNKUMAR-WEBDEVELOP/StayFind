/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: 
  {
    extend: 
    {
      animation: 
      {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 1.5s ease-out',
      },
      keyframes: {
        fadeIn: 
        {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }
      
    },
  },
  plugins: [],
}


