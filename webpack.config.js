const path = require('path');

module.exports = [
  'source-map'
].map(devtool => ({
  entry: './src/fleet.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'fleet.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'fleet',
  },
  devtool
}));