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
				start_url: '/',
				scope: '/',
				display: 'standalone',
				theme_color: "#f4502a",
				background_color: "#ffffff",
				icons: [
					{
						src: '/small.png',
						sizes: '250x175',
						type: 'image/png',
					},
					{
						src: '/large.png',
						sizes: '500x350',
						type: 'image/png',
					},
					{
						src: '/xlarge.png',
						sizes: '1000x700',
						type: 'image/png',
					},
				],
			},
			injectManifest: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
			},
			devOptions: {
				enabled: true,
				type: 'module',
				navigateFallback: '/',
			},
		})
	]
});
