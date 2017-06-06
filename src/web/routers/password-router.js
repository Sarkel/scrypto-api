/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 06/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {ServerError} = require('../utilities/error-factory');
const {Encryption} = require('../utilities/encryption');

const CHANGE_PASSWORD =
    'UPDATE scrypto.sc_user SET password = $[password], seed = $[seed] WHERE id = $[userId] AND active = true;';

class PasswordRouter extends BaseRouter {
    constructor() {
        super();
        this._setRoutes();
    }

    _setRoutes() {
        this._createPatchRoute('/:code', this._change);
    }

    getUri() {
        return '/activate';
    }

    async _change(req, res, next) {
        try {
            const code = req.params.code;
            const userId = await this._redis.get(code);
            await this._pgDb.task(conn => {
                return conn.none(CHANGE_PASSWORD,
                    Object.assign({userId}, Encryption.encryptPassword(req.body.password))
                );
            });
            this._redis.del(code);
            this._responseFactory.buildSuccessResponse(res, 201);
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }
}

module.exports = {PasswordRouter};