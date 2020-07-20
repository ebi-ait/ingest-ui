const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        DFEATURES: JSON.stringify(process.env.DFEATURES)
      }
    })
  ]
};
