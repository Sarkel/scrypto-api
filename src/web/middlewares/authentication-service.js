/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
const {
    MissingAuthenticationMethodError,
    BaseError,
    ServerError,
    MissingAuthorizationTokenError} = require('../utilities/error-factory');
const {AuthenticationToken} = require('../utilities/authentication-token');
const {ResponseFactory} = require('../utilities/response-factory');

class AuthenticationService {
    _responseFactory = ResponseFactory.getInstance();

    static _extractTokenFromHeader(header) {
        if (header) {
            const [, token] = header.split(' ');
            if (values[0] === 'Bearer') {
                return token;
            } else {
                throw new MissingAuthenticationMethodError();
            }
        } else {
            return header;
        }
    }

    async authenticateToken(req, res, next) {
        try {
            const token = req.body.token ||
                req.query.token ||
                Authentication._extractTokenFromHeader(req.headers['authorization']);
            if (token) {
                await AuthenticationToken.verify(token);
                next();
            } else {
                this._responseFactory.propagateError(next, new MissingAuthorizationTokenError());
            }
        } catch (e) {
            this._responseFactory.propagateError(next, e instanceof BaseError ? e : new ServerError(e));
        }
    }
}

module.exports = {AuthenticationService};