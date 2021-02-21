module.exports = {
  entry: './src/main.js',
  mode: 'development',
  optimization: {
    minimize: false,
  },
  devtool:'eval-cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [ '@babel/transform-react-jsx', {pragma: 'createElement'}],
            ]
          }
        }
      }
    ]
  }
}