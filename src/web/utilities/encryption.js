/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const bcrypt = require('bcrypt-nodejs');

function createHashMessage(password, seed) {
    return seed + password + seed;
}

function encryptPassword(password) {
    const seed = Math.random().toString(36).substring(5, 20);
    return {
        password: bcrypt.hashSync(createHashMessage(password, seed)),
        seed: seed
    };
}

function comparePasswords(password, seed, hashPassword) {
    return bcrypt.compareSync(createHashMessage(password, seed), hashPassword);
}

const encryption = {
    encryptPassword,
    comparePasswords
};

module.exports = encryption;