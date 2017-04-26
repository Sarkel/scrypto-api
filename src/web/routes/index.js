/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
const express = require('express'),
    router = express.Router(),
    authenticated = require('./authenticated'),
    middlewares = require('../middlewares'),
    unauthenticated = require('./unauthenticated');

router.use('/auth', authenticated);
router.use(middlewares.authenticateToken);
router.use('/', unauthenticated);

module.exports = router;