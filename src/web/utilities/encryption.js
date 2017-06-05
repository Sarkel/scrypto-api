/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const bcrypt = require('bcrypt-nodejs');
const randomString = require('random-string');

class Encryption {
    static encryptPassword(password) {
        const seed = randomString();
        return {
            password: bcrypt.hashSync(Encryption._createHashMessage(password, seed)),
            seed: seed
        };
    }

    static _createHashMessage(password, seed) {
        return seed + password + seed;
    }

    static comparePasswords(password, seed, hashPassword) {
        return bcrypt.compareSync(Encryption._createHashMessage(password, seed), hashPassword);
    }
}

module.exports = {Encryption};