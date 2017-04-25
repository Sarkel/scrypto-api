/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const redisClient = require('../../lib/redis'),
    gpc = require('generate-pincode');

function sendEmail() {
    return Promise.resolve(); // TODO send email via Salesforce
}

function sendVerificationCode(user) {
    const code = gpc(4);
    redisClient.set(code, user.id);
    return sendEmail();
}

const email = {
    sendVerificationCode
};

module.exports = email;