/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 24/04/2017
 * @Description
 */

'use strict';
const express = require('express'),
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    responseFactory = require('./utilities/response-factory'),
    errors = require('./utilities/errors'),
    port = process.env.PORT || 5000,
    app = express(),
    path = require('path'),
    webpackBuild = require('../web-page/webpack-build');

require('express-ws')(app);

const routes = require('./routes');

app.set('port', port);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(helmet());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api/v1', routes);

app.use((req, res, next) => {
    responseFactory.propagateError(next, errors.ROUTE_NOT_FOUND)
});

app.use((err, req, res, next) => {
    responseFactory.buildErrorResponse(res, err);
    console.error(err);
});

webpackBuild();

app.listen(port, () => {
    console.log('Node app is running on port', port);
});