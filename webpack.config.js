const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
	// webpack will take the files from ./src/index
	entry: "./src/index",
	// and output it into /dist as bundle.js
	output: {
		path: path.join(__dirname, "/dist"),
		filename: "bundle.js",
		publicPath: "/",
	},
	module: {
		rules: [
			{
				test: /\.(ts|js)x?$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			// css-loader to bundle all the css files into one file and style-loader to add all the styles  inside the style tag of the document
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
				exclude: /node_modules/,
				use: ["file-loader?name=[name].[ext]"], // ?name=[name].[ext] is only necessary to preserve the original file name
			},
		],
	},
	devServer: {
		contentBase: path.join(__dirname, "./dist"),
		port: 8080,
		historyApiFallback: true,
		// proxy: {
		// 	"/users": {
		// 		target: "http://localhost:3000",
		// 		changeOrigin: true,
		// 	},
		// },
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html",
		}),
	],
};
