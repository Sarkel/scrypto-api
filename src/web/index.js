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
    routes = require('./routes'),
    responseFactory = require('./utilities/response-factory'),
    errors = require('./utilities/errors'),
    port = process.env.PORT || 5000,
    app = express();

const wsApp = require('express-ws')(app);

app.set('port', port);

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

app.listen(port, () => {
    console.log('Node app is running on port', port);
});