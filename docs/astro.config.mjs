import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi';

// https://astro.build/config
export default defineConfig({
	site: 'https://fixie-ai.github.io',
	base: '/ultradox',
	integrations: [
		starlight({
			title: 'Ultravox API',
			// editLink: {
			// 	baseUrl: 'https://github.com/fixie-ai/ultravox/documentation',
			// },
			plugins: [
				// Generate Ultravox API from OpenAPI spec
				starlightOpenAPI([
					{
						base: 'api-reference',
						schema: './src/content/schemas/ultravox.yml',
						collapsed: true,
					},
				]),
			],
			customCss: [
				'./src/styles/custom.css',
			],
			logo: {
				dark: './src/assets/logos/UVMarkWhite.svg',
				light: './src/assets/logos/UVMarkBlack.svg'
			},
			social: {
				github: 'https://github.com/fixie-ai/ultravox',
				discord: 'https://discord.gg/Qw6KHxv8YB',
			},
			sidebar: [
				{ label: 'Welcome', link: '/' },
				{ label: 'Quickstart', link: 'guides/quickstart' },
				{ label: 'API Reference',
					collapsed: false,
					items: [
					...openAPISidebarGroups,
				]},
			],
			components: {
			},
		}),
	]
});
