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
        label: 'Guides',
        collapsed: false,
        items: [
          'guides/connectionoptions',
          'tools',
          'guides/stages',
          'guides/clienttoolstutorial',
          'guides/callstagestutorial',
        ]
      },
      {
        label: 'API',
        autogenerate: {
          directory: 'api'
        }
      },
      {
        label: 'SDK',
        collapsed: false,
        items: [
          'sdk',
          'datamessages'
        ]
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