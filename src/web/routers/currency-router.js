/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {ServerError} = require('../utilities/error-factory');

class CurrencyRouter extends BaseRouter {
    static _GET_ALL_FIRST_CURRENCY = 'SELECT c.first AS name FROM scrypto.sc_currency AS c GROUP BY c.first;';
    static _LATEST_CURRENCY_DATA =
        'SELECT * FROM data_puller.dp_newest_currency_data WHERE lower(first) = lower(${name});';

    static _URI = '/currency';

    _setRoutes() {
        this._createGetRoute('/', this._getTabs);
        this._createGetRoute('/latest', this._getLatest);
    }

    getUri() {
        return Currency._URI;
    }

    async _getTabs(req, res, next) {
        try {
            const currencies = await this._pgDb.task(conn => {
                return conn.manyOrNone(Currency._GET_ALL_FIRST_CURRENCY);
            });
            this._responseFactory.buildSuccessResponse(res, 200, currencies);
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }

    async _getLatest(req, res, next) {
        try {
            const recentCurrencyData = await this._pgDb.task(conn => {
                return conn.manyOrNone(Currency._LATEST_CURRENCY_DATA);
            });
            this._responseFactory.buildSuccessResponse(res, 200, recentCurrencyData);
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }
}

module.exports = {CurrencyRouter};