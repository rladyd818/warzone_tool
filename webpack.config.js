const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
	// webpack will take the files from ./src/index
	entry: "./src/View.js",
	// and output it into /dist as bundle.js
	output: {
		path: path.join(process.cwd(), "src"),
		filename: "./bundle.js",
		// publicPath: "/",
	},
	// target: "electron-renderer",
	devtool: "eval-cheap-module-source-map",
	module: {
		rules: [
			{
				test: /\.js?$/,
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
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html",
		}),
	],
};
