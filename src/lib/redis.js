/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const {createClient} = require('then-redis');

const redisClient = createClient(process.env.REDIS_URL);

module.exports = {redisClient};