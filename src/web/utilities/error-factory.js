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
    constructor() {
        super();
        this._message = 'Not Found';
        this._status = 404;
    }
}

class MissingAuthenticationMethodError extends BaseError {
    constructor() {
        super();
        this._message = 'Authorization method is missing';
        this._status = 401;
    }
}

class MissingAuthorizationTokenError extends BaseError {
    constructor() {
        super();
        this._message = 'Token is missing';
        this._status = 401;
    }
}

class InvalidAuthorizationToken extends BaseError {
    constructor() {
        super();
        this._message = 'Invalid token';
        this._status = 401;
    }
}

class InvalidCredentialsError extends BaseError {
    constructor() {
        super();
        this._message = 'Invalid email or password';
        this._status = 401;
    }
}

class ServerError extends BaseError {
    constructor() {
        super();
        this._message = 'Server error';
        this._status = 500;
    }
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