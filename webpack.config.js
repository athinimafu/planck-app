const path = require("path");

module.exports = {
    target:"electron-renderer",
    entry:"./src/index.js",
    output:{
        path:__dirname,
        filename:"index-bundled.js"
    },
    mode:"development",
    module:{
        rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
              }
            }
        ]
    }
}