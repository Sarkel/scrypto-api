/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 06/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {ServerError, BadRequestError} = require('../utilities/error-factory');
const {Encryption} = require('../utilities/encryption');
const {EmailService} = require('../email-service');

const CHANGE_PASSWORD = 'SELECT scrypto.sc_change_password($[password], $[seed], $[userId]);';

class PasswordRouter extends BaseRouter {
    constructor() {
        super();
        this._change = this._change.bind(this);
        this._setRoutes();
    }

    _setRoutes() {
        this._createPatchRoute('/:code', this._change);
    }

    getUri() {
        return '/password';
    }

    async _change(req, res, next) {
        try {
            const code = req.params.code;
            const userId = await this._redis.get(code);
            this._redis.del(code);
            if(userId) {
                const user = await this._pgDb.task(conn => {
                    return conn.any(CHANGE_PASSWORD,
                        Object.assign({userId}, Encryption.encryptPassword(req.body.password))
                    );
                });
                if(user) {
                    await EmailService.sendPasswordChangeNotification(user.email, user.name);
                    this._responseFactory.buildSuccessResponse(res, 205);
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

module.exports = {PasswordRouter};