/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const jwt = require('jsonwebtoken'),
    uuid = require('uuid'),
    algorithm = 'HS512';

function verify(next, token, callback) {
    jwt.verify(token, process.env.AUTHENTICATION_SECRET, {algorithms: [algorithm]}, callback.bind(null, next));
}

function getToken() {
    return jwt.sign(
        {
            value1: uuid.v4(),
            value2: uuid.v4(),
            value3: uuid.v4(),
            value4: uuid.v4()
        },
        process.env.AUTHENTICATION_SECRET,
        {
            expiresIn: process.env.TOKEN_EXPIRATION,
            algorithm
        }
    );
}

const authenticationToken = {
    verify,
    getToken
};

module.exports = authenticationToken;