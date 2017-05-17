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
    cors = require('cors');

require('express-ws')(app);

const routes = require('./routes');

app.set('port', port);
app.use(bodyParser.json());
app.use(helmet());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());
app.options('*', cors());

app.use('/api/v1', routes);

app.use((err, req, res, next) => {
    responseFactory.buildErrorResponse(res, err);
    console.error(err);
});

app.listen(port, () => {
    console.log('Node app is running on port', port);
});