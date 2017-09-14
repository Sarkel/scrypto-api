/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 06/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {ServerError, BadRequestError} = require('../utilities/error-factory');
const {EmailService} = require('../email-service');

const ACTIVATE_USER = 'SELECT scrypto.sc_activate_user($[userId]);';

class ActivateRouter extends BaseRouter {
    constructor() {
        super();
        this._doActivate = this._doActivate.bind(this);
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
            if(userId) {
                const user = await this._pgDb.task(conn => {
                    return conn.oneOrNone(ACTIVATE_USER, {userId})
                });
                this._redis.del(code);
                if(user) {
                    await EmailService.sendAccountActivationNotification(user.email, user.name);
                    this._responseFactory.buildSuccessResponse(res, 201);
                } else {
                    this._responseFactory.propagateError(next, new BadRequestError());
                }
            } else {
                this._responseFactory.propagateError(next, new BadRequestError());
            }
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }
}

module.exports = {ActivateRouter};