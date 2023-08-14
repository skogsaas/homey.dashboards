//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

const env = process.env['NODE_ENV'];
const cmd = process.env['npm_lifecycle_event'];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			fallback: 'index.html'
		}),
		paths: {
            base: env === 'production' && cmd !== 'build-pages' ? '/app/skogsaas.dashboards/assets/dashboard' : '',
        }
	}
};

export default config;
