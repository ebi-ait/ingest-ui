const webpack = require('webpack');

let env = Object.keys(process.env);

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'ENV_VARS': env
    })
  ]
};
