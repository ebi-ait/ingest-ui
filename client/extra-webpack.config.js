const webpack = require('webpack');

let env = {};
Object.entries(process.env).forEach(entry => {
  const [key, value] = entry;
  env[key] = JSON.stringify(value);
});

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'ENV_VARS': env
    })
  ]
};
