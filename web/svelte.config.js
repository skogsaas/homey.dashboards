//import adapter from '@sveltejs/adapter-auto';
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

const target = process.env["PUB_TARGET"];

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess({})],

  kit: {
    adapter: adapter({
      fallback: "index.html",
      precompress: true,
    }),
    paths: {
      base: target === "app" ? "/app/skogsaas.dashboards/assets/dashboard" : "",
    },
    version: {
      name: pkg.version,
    }
  },
};

export default config;
