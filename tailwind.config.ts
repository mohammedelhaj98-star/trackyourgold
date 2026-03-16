import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#f6b500',
          deep: '#a66f00',
        },
      },
    },
  },
  plugins: [],
};

export default config;
