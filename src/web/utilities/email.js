/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const {redisClient} = require('../../lib/redis');
const gpc = require('generate-pincode');
const {EmailService} = require('../email-service');

class Email {
    static sendVerificationCode(userId, userEmail, userName) {
        const code = gpc(4);
        redisClient.set(code, userId);
        return EmailService.sendVerificationCode(userEmail, userName, code);
    }
}

module.exports = {Email};