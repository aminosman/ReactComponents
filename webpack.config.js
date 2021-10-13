const WebpackNotifierPlugin = require("webpack-notifier");
const baseConfig = {
  context: `${__dirname}`,
  entry: {
    index: ["babel-polyfill", "./src/index.js"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: ["@babel/plugin-proposal-class-properties"],
        },
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts", "css"],
  },
  mode: "development",
  watch: true,
  devtool: "source-map",
  plugins: [
    new WebpackNotifierPlugin({
      alwaysNotify: true,
      title: "Mars Component Review",
    }),
  ],
  // Great optimization for later
  // externals: {
  // 	"react": "React",
  // 	"react-dom": "ReactDOM"
  // }
};

const recipeConfig = Object.assign({}, baseConfig, {
  output: {
    filename: "[name].bundle.js",
    path: `${__dirname}`,
  },
});

// const clientConfig = Object.assign({}, baseConfig, {
// 	output: {
// 		filename: '[name].bundle.js',
// 		path: `${__dirname}/../../../Client/Scripts`,
// 	},
// })

module.exports = [recipeConfig];
