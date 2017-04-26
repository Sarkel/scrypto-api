/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const redisClient = require('../../lib/redis'),
    gpc = require('generate-pincode'),
    emails = require('../emails');

function sendVerificationCode(user) {
    const code = gpc(4);
    redisClient.set(code, user.id);
    return emails.sendVerificationCode(user.email, user.name, code);
}

const verification = {
    sendVerificationCode
};

module.exports = verification;