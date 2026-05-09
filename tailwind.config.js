/** @type {import('tailwindcss').Config} */
export default {
  // Use 'class' strategy so dark mode is controlled by adding `dark` class to <html>
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      // ─── Font ───────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ─── Color Palette ──────────────────────────────────────────────────
      // NOTE: Keys are FLAT so Tailwind generates classes like:
      //   text-accent, bg-workspace-bg, text-ink-primary, etc.
      colors: {
        // Workspace surfaces - Sleek Monochrome Dark
        'workspace-bg':      '#111111',
        'workspace-surface': '#171717',
        'workspace-raised':  '#222222',
        'workspace-border':  '#2a2a2a',
        'workspace-hover':   '#262626',

        // Accent (Subtle violet/blue)
        'accent':            '#818cf8',
        'accent-light':      '#a5b4fc',
        'accent-muted':      '#4f46e5',

        // Text hierarchy - crisp and neutral
        'ink-primary':       '#f4f4f5',
        'ink-secondary':     '#a1a1aa',
        'ink-muted':         '#71717a',
        'ink-faint':         '#52525b',

        // AI Provider brand colors
        'ai-gpt':            '#10a37f',
        'ai-claude':         '#d4a96a',
        'ai-gemini':         '#4285f4',
      },

      // ─── Border Radius ──────────────────────────────────────────────────
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'24px',
      },

      // ─── Box Shadow ─────────────────────────────────────────────────────
      boxShadow: {
        'panel':  '0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)',
        'card':   '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.25)',
        'accent': '0 0 16px rgba(129,140,248,0.15)',
        'inset':  'inset 0 1px 0 rgba(255,255,255,0.03)',
      },

      // ─── Spacing extras ─────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },

      // ─── Animation ──────────────────────────────────────────────────────
      transitionDuration: {
        '200': '200ms',
        '250': '250ms',
      },

      // ─── h-dvh support ──────────────────────────────────────────────────
      height: {
        'dvh': '100dvh',
      },
      minHeight: {
        'dvh': '100dvh',
      },
    },
  },

  plugins: [],
}
