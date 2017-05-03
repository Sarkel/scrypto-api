/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 03/05/2017
 * @Description
 */

'use strict';
const path = require('path'),
    webpack = require('webpack'),
    CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: path.join(__dirname, 'app/index.js'),
    output: {
        path: path.join(__dirname, '../web/public'),
        filename: 'bundle.js',
        publicPath: '/assets/'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '/app/index.html')
            }
        ]),
        // new webpack.optimize.UglifyJsPlugin({
        //     minimize: true,
        //     compress: {
        //         warnings: false
        //     }
        // })
    ],
    module: {
        loaders: [
            {
                test: /.\.js?$/,
                loader: 'babel-loader',
                include: path.join(__dirname, 'app'),
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
};