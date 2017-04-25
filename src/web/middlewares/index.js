/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
const errors = require('../utilities/errors'),
    responseFactory = require('../utilities/response-factory'),
    authenticationToken = require('../utilities/authentication-token');

function extractTokenFromHeader(next, header) {
    if (header) {
        const values = header.split(' ');
        if (values[0] === 'Bearer') {
            return values[1];
        } else {
            responseFactory.propagateError(next, errors.MISSING_AUTHORIZATION_METHOD);
        }
    } else {
        return header;
    }
}

function verifyToken(next, err) {
    if (err) {
        responseFactory.propagateError(next, errors.INVALID_AUTHORIZATION_TOKEN);
    } else {
        next();
    }
}

function authenticateToken(req, res, next) {
    const token = req.body.token || req.query.token || extractTokenFromHeader(next, req.headers['authorization']);
    if (token) {
        authenticationToken.verify(next, token, verifyToken);
    } else {
        responseFactory.propagateError(next, errors.MISSING_AUTHORIZATION_TOKEN);
    }
}

const middlewares = {
    authenticateToken
};

module.exports = middlewares;