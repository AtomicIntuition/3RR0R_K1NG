import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#0a0a0f',
          50: '#12121a',
          100: '#1a1a2e',
          200: '#2d2d44',
        },
        terminal: {
          DEFAULT: '#00ff41',
          bright: '#39ff14',
        },
        neon: {
          cyan: '#22d3ee',
          purple: '#a855f7',
          yellow: '#facc15',
          orange: '#fb923c',
        },
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
};

export default config;
