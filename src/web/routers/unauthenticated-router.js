/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {InvalidCredentialsError, ServerError} = require('../utilities/error-factory');
const {Encryption} = require('../utilities/encryption');
const {Email} = require('../utilities/email');
const {ActivateRouter} = require('./activate-router');
const {PasswordRouter} = require('./password-router');
const {AuthenticationToken} = require('../utilities/authentication-token');

class UnauthenticatedRouter extends BaseRouter {
    static _URI = '/auth';

    _activateRouter = new ActivateRouter();
    _passwordRouter = new PasswordRouter();

    static _GET_ACTIVE_USER_BY_EMAIL_OR_ID =
        `SELECT u.id, u.email, u.password, u.name, u.seed 
            FROM scrypto.sc_user AS u 
            WHERE (u.email = $[email] OR u.id = $[userId]) AND u.active = true;`;

    static _CREATE_USER =
        `INSERT INTO scrypto.sc_user(email, password, seed, name) 
            VALUES($[email], $[password], $[seed], $[name]);`;

    static _GET_USER_BY_EMAIL = `SELECT u.id, u.name, u.email FROM scrypto.sc_user AS u WHERE u.email = $[email];`;

    _setRoutes() {
        this._createPostRoute('/login', this._login);
        this._createPostRoute('/register', this._register);
        this._createPostRoute('/verification', this._verification);
        this._createRoute(this._activateRouter.getUri(), this._activateRouter.getRouter());
        this._createRoute(this._passwordRouter.getUri(), this._passwordRouter.getRouter());
    }

    getUri() {
        return UnauthenticatedRouter._URI;
    }

    async _login(req, res, next) {
        try {
            const user = await this._pgDb.task(conn => {
                return conn.oneOrNone(UnauthenticatedRouter._GET_ACTIVE_USER_BY_EMAIL_OR_ID, {
                    email: req.body.email,
                    userId: null
                });
            });
            if (user && Encryption.comparePasswords(req.body.password, user.seed, user.password)) {
                this._responseFactory.buildSuccessResponse(res, 200, {
                    user_id: user.id,
                    name: user.name,
                    token: AuthenticationToken.getToken()
                });
            } else {
                this._responseFactory.propagateError(next, new InvalidCredentialsError(err));
            }
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }

    async _register(req, res, next) {
        try {
            const [, user] = await thi._pgDb.task(conn => {
                return Promise.all([
                    conn.none(UnauthenticatedRouter._CREATE_USER, Object.assign({
                            email: req.body.email,
                            name: req.body.name
                        },
                        Encryption.encryptPassword(req.body.password))
                    ),
                    conn.one(UnauthenticatedRouter._GET_USER_BY_EMAIL, {email: req.body.email})
                ]);
            });
            await Email.sendVerificationCode(user.id, user.email, user.name);
            this._responseFactory.buildSuccessResponse(res, 201);
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }

    async _verification(req, res, next) {
        try {
            const user = await this._pgDb.task(conn => {
                return conn.oneOrNone(UnauthenticatedRouter._GET_ACTIVE_USER_BY_EMAIL_OR_ID, {
                    email: req.body.email,
                    userId: req.body.id
                });
            });
            await Email.sendVerificationCode(user.id, user.email, user.name);
            this._responseFactory.buildSuccessResponse(res, 200);
        } catch (err) {
            this._responseFactory.propagateError(next, errors.SERVER_ERROR, err);
        }
    }
}

module.exports = {UnauthenticatedRouter};