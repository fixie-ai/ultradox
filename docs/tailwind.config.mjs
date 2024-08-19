import starlightPlugin from '@astrojs/starlight-tailwind';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
      colors: {
        // Your preferred accent color. Indigo is closest to Starlight’s defaults.
        accent: {
          DEFAULT: '#c60e00',
          '50': '#fff1f0',
          '100': '#ffe0dd',
          '200': '#ffc5bf',
          '300': '#ff9f95',
          '400': '#ff6b5b',
          '500': '#ff3d28',
          '600': '#ff1800',
          '700': '#c60e00',  // Our original color
          '800': '#a30b00',
          '900': '#870a00',
        },
        // Your preferred gray scale. Zinc is closest to Starlight’s defaults.
        gray: colors.zinc,
      },
      fontFamily: {
        // Your preferred text font. Starlight uses a system font stack by default.
        // sans: ['"Atkinson Hyperlegible"'],
        // Your preferred code font. Starlight uses system monospace fonts by default.
        // mono: ['"IBM Plex Mono"'],
      },
    },
	},
	plugins: [starlightPlugin()],
}
