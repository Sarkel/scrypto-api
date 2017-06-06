/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 06/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {ServerError} = require('../utilities/error-factory');

const ACTIVATE_USER = 'SELECT scrypto.sc_activate_user($[userId]);';

class ActivateRouter extends BaseRouter {
    constructor() {
        super();
        this._setRoutes();
    }

    _setRoutes() {
        this._createPatchRoute('/:code', this._doActivate);
    }

    getUri() {
        return '/activate';
    }

    async _doActivate(req, res, next) {
        try {
            const code = req.params.code;
            const userId = await this._redis.get(code);
            await this._pgDb.task(conn => {
                return conn.none(ACTIVATE_USER, {userId})
            });
            this._redis.del(code);
            this._responseFactory.buildSuccessResponse(res, 201);
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }
}

module.exports = {ActivateRouter};