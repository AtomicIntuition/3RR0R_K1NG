import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Hacker aesthetic palette
        void: {
          DEFAULT: '#0a0a0f',
          50: '#16161f',
          100: '#1a1a24',
          200: '#22222e',
        },
        neon: {
          green: '#00ff41',
          red: '#ff0040',
          cyan: '#00f0ff',
          purple: '#bf00ff',
          yellow: '#fffc00',
          orange: '#ff6b00',
        },
        terminal: {
          DEFAULT: '#00ff41',
          dim: '#00cc33',
          bright: '#33ff66',
        },
        danger: {
          DEFAULT: '#ff0040',
          dim: '#cc0033',
          bright: '#ff3366',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
        'glitch-2': 'glitch-2 0.7s linear infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flicker': 'flicker 0.15s infinite',
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
        'count-up': 'count-up 1.5s ease-out forwards',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'glitch-2': {
          '0%, 100%': { transform: 'translate(0)', opacity: '1' },
          '33%': { transform: 'translate(3px, -1px)', opacity: '0.8' },
          '66%': { transform: 'translate(-3px, 1px)', opacity: '0.8' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        typing: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        blink: {
          '50%': { borderColor: 'transparent' },
        },
        'count-up': {
          from: { '--num': '0' },
          to: { '--num': 'var(--target)' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)`,
        'scanline': 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
