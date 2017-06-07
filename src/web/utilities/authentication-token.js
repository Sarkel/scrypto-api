/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const {InvalidAuthorizationToken} = require('./error-factory');

const ALGORITHMS = ['HS512'];

class AuthenticationToken {
    static getToken() {
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

    static verify(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(
                token,
                process.env.AUTHENTICATION_SECRET,
                {
                    algorithms: ALGORITHMS
                },
                err => {
                    if (err) {
                        reject(new InvalidAuthorizationToken(err));
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
}

module.exports = {AuthenticationToken};