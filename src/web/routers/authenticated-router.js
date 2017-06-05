/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {CurrencyRouter} = require('./currency-router');
const {SearchRouter} = require('./search-router');
const {UserRouter} = require('./user-router');

class AuthenticatedRouter extends BaseRouter {
    static _URI = '/';

    _currencyRouter = new CurrencyRouter();
    _searchRouter = new SearchRouter();
    _userRouter = new UserRouter();

    _setRoutes() {
        this._createRoute(this._currencyRouter.getUri(), this._currencyRouter.getRouter());
        this._createRoute(this._searchRouter.getUri(), this._searchRouter.getRouter());
        this._createRoute(this._userRouter.getUri(), this._userRouter.getRouter());
    }

    getUri() {
        return AuthenticatedRouter._URI;
    }
}

module.exports = {AuthenticatedRouter};