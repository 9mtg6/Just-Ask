import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#b91c1c',
          700: '#7f1d1d',
          900: '#4c0f0f'
        },
        surface: '#111827'
      },
      boxShadow: {
        soft: '0 8px 35px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
};

export default config;
