import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			srcDir: './src',
			mode: 'development',
			strategies: "generateSW",
			injectRegister: 'auto',
			registerType: 'autoUpdate',
			manifest: {
				short_name: 'Homeyboard',
				name: 'Homeyboard',
				start_url: '/favorite/',
				scope: '/',
				display: 'standalone',
				theme_color: "#f4502a",
				background_color: "#ffffff",
				icons: [
					{
						src: '/512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: '/256.png',
						sizes: '256x256',
						type: 'image/png',
					},
					{
						src: '/128.png',
						sizes: '128x128',
						type: 'image/png',
					},
					{
						src: '/64.png',
						sizes: '64x64',
						type: 'image/png',
					},
					{
						src: '/32.png',
						sizes: '32x32',
						type: 'image/png',
					},
				],
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
				maximumFileSizeToCacheInBytes: 4096000
			},
			devOptions: {
				enabled: true,
				type: 'module',
				navigateFallback: '/',
			},
		})
	]
});
