module.exports = {
  // 在必要时更改为 .tsx
  entry: './src/app.jsx',
  output: {
    filename: './bundle.js'
  },
  resolve: {
    // 原有扩展名: [".js", ".jsx"]
    extensions: [".ts", ".tsx", ".js", ".jsx"]
    
  },
  module: {
    rules: [
      // 原来的配置： { test: /\.jsx?$/, use: { loader: 'babel-loader' }, exclude: /node_modules/ },
      { test: /\.(t|j)sx?$/, use: { loader: 'ts-loader' }, exclude: /node_modules/ },

      // 额外 - 添加资源图支持
      { enforce: "pre", test: /\.js$/, exclude: /node_modules/, loader: "source-map-loader" }
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  },
  // 额外 - 添加资源图支持
  devtool: "source-map"
}