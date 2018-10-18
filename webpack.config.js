const path = require("path");
const nodeExternals = require("webpack-node-externals");

const mode = "development";
const devtool = "source-map";

const rules = [
  {
    test: /\.tsx?$/,
    loader: "awesome-typescript-loader",
    options: {
      silent: true
    }
  },
  {
    test: /\.scss$/,
    use: ["style-loader", "css-loader", "sass-loader"]
  },
  {
    test: /\.css$/,
    use: ["style-loader", "css-loader"]
  },
  {
    test: /\.svg$/,
    use: [
      {
        loader: "react-svg-loader"
      }
    ]
  },
  {
    test: /\.(woff|woff2)$/,
    use: [
      {
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]"
        }
      }
    ]
  }
];

const resolve = {
  extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  modules: ["node_modules/"]
};

const output = {
  path: path.resolve(__dirname, "dist"),
  filename: "[name].js",
  publicPath: "/"
};

const base = {
  mode,
  devtool,
  output,
  module: {
    rules
  },
  resolve
};

module.exports = [
  {
    ...base,

    entry: {
      tab: path.resolve(__dirname, "./src/tab.tsx")
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      publicPath: "/",
      library: "UltimateQuebecCalendar"
    }
  },
  {
    ...base,

    entry: {
      background: path.resolve(__dirname, "./src/background.ts")
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js"
    }
  },
  {
    ...base,

    entry: {
      options: path.resolve(__dirname, "./src/options.tsx")
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      publicPath: "/"
    }
  }
];
