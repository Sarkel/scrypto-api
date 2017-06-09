/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 06/06/2017
 * @Description
 */

'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const {Logger} = require('../lib/logger');
const {AppRouter} = require('./routers/app-router');
const {ResponseFactory} = require('./utilities/response-factory');
const morgan = require('morgan');

const PORT = process.env.PORT || 5000;

class App {
    constructor() {
        this._app = express();
        this._logger = Logger.getInstance();
        this._responseFactory = ResponseFactory.getInstance();

        this._app.set('port', PORT);
        this._app.use(morgan('dev'));
        this._app.use(bodyParser.json());
        this._app.use(bodyParser.urlencoded({extended: false}));

        this._setCors();
        this._app.post('/test', (req, res, next) => {
            console.log();
            res.json();
        });
        this._createRoutes();
        this._createErrorHandler();
    }

    static run() {
        new App().listen();
    }

    _setCors() {
        const corsSettings = cors();
        this._app.use(corsSettings);
        this._app.options('*', corsSettings);
    }

    _createRoutes() {
        const appRouter = new AppRouter();
        this._app.use(appRouter.getUri(), appRouter.getRouter());
    }

    _createErrorHandler() {
        this._app.use((err, req, res, next) => {
            this._responseFactory.buildErrorResponse(res, err);
        });
    }

    listen() {
        this._app.listen(PORT, () => {
            this._logger.info(`'Node app is running on port: ${PORT}'`);
        });
    }
}

module.exports = {App};