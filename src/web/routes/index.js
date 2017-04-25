/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
const express = require('express'),
    router = express.Router(),
    authentication = require('./authentication'),
    middlewares = require('../middlewares');

router.use('/auth', authentication);
router.use(middlewares.authenticateToken);
module.exports = router;