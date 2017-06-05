/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
class BaseError extends Error {
    getStatus() {
        return this._status;
    }

    getMessage() {
        return this._message;
    }
}

class NotFoundError extends BaseError {
    _message = 'Not Found';
    _status = 404;
}

class MissingAuthenticationMethodError extends BaseError {
    _message = 'Authorization method is missing';
    _status = 401;
}

class MissingAuthorizationTokenError extends BaseError {
    _message = 'Token is missing';
    _status = 401;
}

class InvalidAuthorizationToken extends BaseError {
    _message = 'Invalid token';
    _status = 401;
}

class InvalidCredentialsError extends BaseError {
    _message = 'Invalid email or password';
    _status = 401;
}

class ServerError extends BaseError {
    _message = 'Server error';
    _status = 500;
}

module.exports = {
    NotFoundError,
    MissingAuthenticationMethodError,
    MissingAuthorizationTokenError,
    InvalidAuthorizationToken,
    InvalidCredentialsError,
    ServerError,
    BaseError
};