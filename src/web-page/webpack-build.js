/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 03/05/2017
 * @Description
 */

'use strict';
const webpack = require('webpack');
const config = require('./webpack.config');

function build() {
    const compiler = webpack(config);
    console.log('Production web-page build');
    if(process.env.NODE_ENV !== 'production') {
        compiler.watch({
            aggregateTimeout: 300,
            poll: true
        }, err => {
            if(err) {
                console.error(err);
            }
            console.log('Recompilation is done');
        });
    }else {
        compiler.run(err => {
            if (err) {
                console.error(err);
            }
            console.log('Compilation is done');
        });
    }
}

module.exports = build;