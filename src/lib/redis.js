/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 26/04/2017
 * @Description
 */

'use strict';
const redis = require('then-redis');

const redisClient = redis.createClient(process.env.REDIS_URL);

module.exports = redisClient;