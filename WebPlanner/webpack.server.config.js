// Work around for https://github.com/angular/angular-cli/issues/7200

const path = require('path');
const webpack = require('webpack');

module.exports = env => {
  return {
    mode: 'none',
    context: path.resolve(__dirname, 'src'),
    entry: {
      server: '../server/server.ts'
    },
    externals: {
      './dist/server/main': 'require("./server/main")'
    },
    target: 'node',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules']
    },
    optimization: {
      minimize: false,
      usedExports: true
    },
    output: {
      // Puts the output at the root of the dist folder
      path: path.join(__dirname, 'dist-server'),
      //filename: '[name].js',
      library: 'server',
      libraryTarget: "commonjs2"
    },
    devtool: env === "production" ? undefined : 'source-map',
    module: {
      noParse: /polyfills-.*\.js/,
      rules: [
        { test: /\.ts$/, loader: 'ts-loader' },
        {
          // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
          // Removing this will cause deprecation warnings to appear.
          test: /(\\|\/)@angular(\\|\/)core(\\|\/).+\.js$/,
          parser: { system: true },
        },
      ]
    },
    plugins: [
      new webpack.ContextReplacementPlugin(
        // fixes WARNING Critical dependency: the request of a dependency is an expression
        /(.+)?angular(\\|\/)core(.+)?/,
        path.join(__dirname, 'src'), // location of your src
        {} // a map of your routes
      ),
      new webpack.ContextReplacementPlugin(
        // fixes WARNING Critical dependency: the request of a dependency is an expression
        /(.+)?express(\\|\/)(.+)?/,
        path.join(__dirname, 'src'),
        {}
      ),
      new webpack.IgnorePlugin({
        resourceRegExp: /canvas|utf-8-validate|bufferutil/
      })
    ]
  }
};
