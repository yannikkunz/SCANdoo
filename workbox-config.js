module.exports = {
	globDirectory: './',
	globPatterns: [
		'**/*.{css,html,js,json}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};