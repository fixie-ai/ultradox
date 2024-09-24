import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://fixie-ai.github.io',
  // base: '/ultradox',
  integrations: [starlight({
    title: 'Ultravox API',
    // editLink: {
    // 	baseUrl: 'https://github.com/fixie-ai/ultravox/documentation',
    // },
    plugins: [
    ],
    customCss: [
      './src/tailwind.css',
      // './src/styles/custom.css'
    ],
    logo: {
      dark: './src/assets/logos/UVMarkWhite.svg',
      light: './src/assets/logos/UVMarkBlack.svg'
    },
    social: {
      github: 'https://github.com/fixie-ai/ultravox',
      discord: 'https://discord.gg/Qw6KHxv8YB'
    },
    sidebar: [
      {
        label: 'Welcome',
        link: '/'
      },
      {
        label: 'Quickstart',
        link: 'guides/quickstart'
      },
      {
        label: 'Tools in Ultravox',
        link: '/tools'
      },
      {
        label: 'API',
        autogenerate: {
          directory: 'api'
        }
      },
      {
        label: 'SDK',
        link: 'sdk'
      },
    ],
    components: {}
  }), 
  tailwind({
    // Disable the default base styles:
    applyBaseStyles: false,
  }),
],
});