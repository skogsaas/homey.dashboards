const config = {
	content: [
		'./src/**/*.{html,js,svelte,ts}'
	],
	plugins: [
		require("@tailwindcss/typography"),
		require('daisyui')
	],
	daisyui: {
		themes: [
			"light", 
			"dark", 
			"cupcake", 
			"bumblebee", 
			"emerald", 
			"corporate",  
			"synthwave", 
			"retro", 
			"cyberpunk", 
			"valentine", 
			"halloween", 
			"garden", 
			"forest",
			"aqua",
			"lofi",
			"pastel",
			"fantasy",
			"wireframe",
			"black",
			"luxury",
			"dracula",
			"cmyk",
			"autumn",
			"business",
			"acid",
			"lemonade",
			"night",
			"coffee",
			"winter",
			"dim",
			"nord",
			"sunset"]
	}
};

module.exports = config;
