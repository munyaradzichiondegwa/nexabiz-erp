/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── NexaBiz Brand (from GitHub prototype) ──────────────────
        navy: {
          DEFAULT: '#1A2B4A',
          light:   '#223559',
          dark:    '#111D33',
        },
        teal: {
          DEFAULT: '#2DB89E',
          light:   '#3ECDB2',
          dark:    '#1E9E87',
        },
        surface: '#F0F4F8',
        border:  '#D9E2EC',
        // ── Semantic tokens ────────────────────────────────────────
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#2DB89E',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#E05252',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#F0F4F8',
          foreground: '#637693',
        },
        accent: {
          DEFAULT: '#eefaf7',
          foreground: '#1A2B4A',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1A2B4A',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: {
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
    },
  },
  plugins: [],
}
