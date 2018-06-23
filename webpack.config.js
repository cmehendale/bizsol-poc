const path = require('path');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./gen/src/main/frontend/index.js",
  	optimization: { minimize: true},
    output: {
      filename: "bundle.js", path: path.resolve(__dirname, 'dist/www/js'),
      libraryTarget:'window',
      library: 'Application'
    },
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      //extensions: [".ts", ".tsx", ".js"],
      extensions: [".js"],
      modules: ['./node_modules']
    },
    // module: {
    //   rules: [
    //     // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
    //     { test: /\.tsx?$/, 
    //       loader: "ts-loader",
    //       options: {
    //         configFile: 'tsconfig.frontend.json'
    //       },        
    //     }
    //   ]
    // }
  };