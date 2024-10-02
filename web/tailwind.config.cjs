const config = {
  	content: [
		'./src/**/*.{html,js,svelte,ts}'
	],
	plugins: [
		require("@tailwindcss/typography"),
		require('daisyui')
	]
};

module.exports = config;
