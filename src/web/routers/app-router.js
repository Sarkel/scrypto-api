/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 06/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {AuthenticatedRouter} = require('./authenticated-router');
const {UnauthenticatedRouter} = require('./unauthenticated-router');
const {AuthenticationService} = require('../middlewares/authentication-service');

class AppRouter extends BaseRouter {
    static _URI = '/api/v1';

    _authenticatedRouter = new AuthenticatedRouter();
    _unauthenticatedRouter = new UnauthenticatedRouter();

    _setRoutes() {
        this._createRoute(this._unauthenticatedRouter.getUri(), this._unauthenticatedRouter.getRouter());
        this._setMiddleware(new AuthenticationService().authenticateToken);
        this._createRoute(this._authenticatedRouter.getUri(), this._authenticatedRouter.getRouter());
    }

    getUri() {
        return AppRouter._URI;
    }
}

module.exports = {AppRouter};