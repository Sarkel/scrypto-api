/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');

class SearchRouter extends BaseRouter {
    static _URI = '/search';

    _setRoutes() {
        this._createGetRoute('/', this._doSearch);
    }

    _doSearch(req, res, next) {
        //TODO: add search logic
        this._responseFactory.buildSuccessResponse(res, 200);
    }

    getUri() {
        return SearchRouter._URI;
    }
}

module.exports = {SearchRouter};