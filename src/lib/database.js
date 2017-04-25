/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 21/04/2017
 * @Description
 */

'use strict';
const pgp = require('pg-promise')();

pgp.pg.defaults.ssl = true;

module.exports = pgp(process.env.DATABASE_URL);