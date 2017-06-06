/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');

class SearchRouter extends BaseRouter {
    constructor() {
        super();
        this._setRoutes();
    }

    _setRoutes() {
        this._createGetRoute('/', this._doSearch);
    }

    _doSearch(req, res, next) {
        //TODO: add search logic
        this._responseFactory.buildSuccessResponse(res, 200);
    }

    getUri() {
        return '/search';
    }
}

module.exports = {SearchRouter};