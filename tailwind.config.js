/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './content/**/*.json', // menu cards keep their colour classes in content/menus.json
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      // ── Custom palette ──────────────────────────────────────
      colors: {
        jungle: '#27AE60',   // primary green
        sky: '#2980B9',      // blue
        sunshine: '#F39C12', // yellow/orange
        cloud: '#ECF0F1',    // neutral background
        bark: '#795548',     // brown
        cream: '#FFFDE7',    // card background
        coral: '#E74C3C',    // red / warning
        plum: '#9B59B6',     // purple — stage 5 (gallery & reflection)
        lagoon: '#16A085',   // teal — idea & message step
        blossom: '#E91E63',  // pink — stage 4 (pantun creation)
      },

      // ── Font Family ──────────────────────────────────────────
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },

      // ── Animasi Custom ──────────────────────────────────────
      animation: {
        wiggle: 'wiggle 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)',
        shake: 'shake 0.4s ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.68,-0.55,0.265,1.55)',
      },

      // ── Keyframes ───────────────────────────────────────────
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
