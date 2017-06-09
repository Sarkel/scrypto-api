/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {ServerError, BadRequestError} = require('../utilities/error-factory');

const DEACTIVATE_USER = 'SELECT scrypto.sc_deactivate_user($[userId]);';

class UserRouter extends BaseRouter {
    constructor() {
        super();
        this._update = this._update.bind(this);
        this._deactivateUser = this._deactivateUser.bind(this);
        this._setRoutes();
    }

    _setRoutes() {
        this._createDeleteRoute('/:code', this._deactivateUser);
        this._createPatchRoute('/:id', this._update);
    }

    getUri() {
        return '/user';
    }

    async _update(req, res, next) {
        // TODO: add user update logic
        this._responseFactory.buildSuccessResponse(res, 200);
    }

    async _deactivateUser(req, res, next) {
        try {
            const code = req.params.code;
            const userId = await this._redis.get(code);
            this._redis.del(code);
            if(userId) {
                await this._pgDb.task(conn => {
                    return conn.any(DEACTIVATE_USER, {userId});
                });
                this._responseFactory.buildSuccessResponse(res, 205);
            } else {
                this._responseFactory.propagateError(next, new BadRequestError());
            }
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }
}

module.exports = {UserRouter};