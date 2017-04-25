/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
const errorMessages = {
    ROUTE_NOT_FOUND: {
        message: 'Not Found',
        status: 404
    },
    MISSING_AUTHORIZATION_METHOD : {
        message: 'Authorization method is missing',
        status: 401
    },
    MISSING_AUTHORIZATION_TOKEN: {
        message: 'Token is missing',
        status: 401
    },
    INVALID_AUTHORIZATION_TOKEN: {
        message: 'Invalid token',
        status: 401
    },
    INVALID_CREDENTIALS: {
        message: 'Invalid email or password',
        status: 401
    },
    SERVER_ERROR: {
        message: 'Server error'
    }
};

module.exports = errorMessages;