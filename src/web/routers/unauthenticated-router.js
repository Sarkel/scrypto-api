/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 05/06/2017
 * @Description
 */

'use strict';
const {BaseRouter} = require('./base-router');
const {InvalidCredentialsError, ServerError, BadRequestError} = require('../utilities/error-factory');
const {Encryption} = require('../utilities/encryption');
const {Email} = require('../utilities/email');
const {ActivateRouter} = require('./activate-router');
const {PasswordRouter} = require('./password-router');
const {AuthenticationToken} = require('../utilities/authentication-token');

const GET_USER_BY_EMAIL_OR_ID = 'SELECT * FROM scrypto.sc_get_user_by_email_or_id($[email], $[userId]);';

const CREATE_USER = 'SELECT * FROM scrypto.sc_create_user($[email], $[password], $[seed], $[name])';

class UnauthenticatedRouter extends BaseRouter {
    constructor() {
        super();
        this._activateRouter = new ActivateRouter();
        this._passwordRouter = new PasswordRouter();
        this._register = this._register.bind(this);
        this._login = this._login.bind(this);
        this._verification = this._verification.bind(this);
        this._setRoutes();
    }

    _setRoutes() {
        this._createPostRoute('/login', this._login);
        this._createPostRoute('/register', this._register);
        this._createPostRoute('/verification', this._verification);
        this._createRoute(this._activateRouter.getUri(), this._activateRouter._doActivate);
        this._createRoute(this._passwordRouter.getUri(), this._passwordRouter.getRouter());
    }

    getUri() {
        return '/auth';
    }

    async _login(req, res, next) {
        try {
            const user = await this._pgDb.task(conn => {
                return conn.oneOrNone(GET_USER_BY_EMAIL_OR_ID, {
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
                this._responseFactory.propagateError(next, new InvalidCredentialsError());
            }
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }

    async _register(req, res, next) {
        try {
            if(req.body && req.body.password && req.body.email && req.body.name) {
                const user = await this._pgDb.task(conn => {
                    return conn.one(CREATE_USER, Object.assign({
                            email: req.body.email,
                            name: req.body.name
                        },
                        Encryption.encryptPassword(req.body.password))
                    );
                });
                await Email.sendVerificationCode(user.id, user.email, user.name);
                this._responseFactory.buildSuccessResponse(res, 201);
            } else {
                this._responseFactory.propagateError(next, new BadRequestError());
            }
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }

    async _verification(req, res, next) {
        try {
            const user = await this._pgDb.task(conn => {
                return conn.oneOrNone(GET_USER_BY_EMAIL_OR_ID, {
                    email: req.body.email,
                    userId: req.body.id
                });
            });
            if(user) {
                await Email.sendVerificationCode(user.id, user.email, user.name);
                this._responseFactory.buildSuccessResponse(res, 200);
            } else {
                this._responseFactory.propagateError(next, new BadRequestError());
            }
        } catch (err) {
            this._responseFactory.propagateError(next, new ServerError(err));
        }
    }
}

module.exports = {UnauthenticatedRouter};