module.exports = {
	entry: './playground/playground.ts',
	output: {
		filename: 'playground.js',
		path: __dirname + '/playground',
	},
	// Enable sourcemaps for debugging webpack's output.
	devtool: 'source-map',
	resolve: {
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: ['.ts', '.tsx', '.mjs', '.js', '.json'],
	},
	plugins: [],
	module: {
		rules: [
			// All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
			{test: /\.tsx?$/, loader: 'awesome-typescript-loader'},
		],
	},
};