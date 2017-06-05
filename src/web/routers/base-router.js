/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const {Router} = require('express');
const {Logger} = require('../utilities/logger');
const pgDb = require('../../lib/database');
const {ResponseFactory} = require('../utilities/response-factory');
const redisClient = require('../../lib/redis');

class BaseRouter {
    _router = Router();
    _logger = Logger.getInstance();
    _pgDb = pgDb;
    _responseFactory = ResponseFactory.getInstance();
    _redis = redisClient;

    constructor() {
        this._setRoutes();
    }

    _createGetRoute(name, func) {
        this._router.get(name, func);
    }

    _createDeleteRoute(name, func) {
        this._router.delete(name, func);
    }

    _createPatchRoute(name, func) {
        this._router.patch(name, func);
    }

    _createPostRoute(name, func) {
        this._router.post(name, func);
    }

    _createRoute(name, router) {
        this.use(name, router);
    }

    _setMiddleware(middleware) {
        this._router.use(middleware);
    }

    getRouter() {
        return this._router;
    }

    getUri() {
    }

    _setRoutes() {
    }
}

module.exports = {BaseRouter};