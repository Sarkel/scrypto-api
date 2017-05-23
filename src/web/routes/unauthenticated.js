/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
const express = require('express'),
    router = express.Router(),
    pgDb = require('../../lib/database'),
    queries = require('../../lib/queries'),
    responseFactory = require('../utilities/response-factory'),
    errors = require('../utilities/errors'),
    encryption = require('../utilities/encryption'),
    email = require('../utilities/verification'),
    redisClient = require('../../lib/redis'),
    authenticationToken = require('../utilities/authentication-token');

router.post('/login', async (req, res, next) => {
    try {
        const user = await pgDb.task(connection => {
            return connection.oneOrNone(queries.GET_ACTIVE_USER_BY_EMAIL_OR_ID, {
                email: req.body.email,
                userId: null
            });
        });
        if (user && encryption.comparePasswords(req.body.password, user.seed, user.password)) {
            responseFactory.buildSuccessResponse(res, 200, {
                user_id: user.id,
                name: user.name,
                token: authenticationToken.getToken()
            });
        } else {
            responseFactory.propagateError(next, errors.INVALID_CREDENTIALS);
        }
    } catch (err) {
        responseFactory.propagateError(next, errors.SERVER_ERROR, err);
    }
});

router.post('/register', async (req, res, next) => {
    try {
        const results = await pgDb.task(connection => {
            return Promise.all([
                connection.none(queries.CREATE_USER, Object.assign({}, req.body, encryption.encryptPassword(req.body.password))),
                connection.one(queries.GET_USER_BY_EMAIL, {email: req.body.email})
            ]);
        });
        await email.sendVerificationCode(results[1]);
        responseFactory.buildSuccessResponse(res, 201);
    } catch (err) {
        responseFactory.propagateError(next, errors.SERVER_ERROR, err);
    }
});

router.post('/verification', async (req, res, next) => {
    try {
        const user = await pgDb.task(connection => {
            return connection.oneOrNone(queries.GET_ACTIVE_USER_BY_EMAIL_OR_ID, {
                email: req.body.email,
                userId: req.body.id
            });
        });
        await email.sendVerificationCode(user);
        responseFactory.buildSuccessResponse(res, 200);
    } catch (err) {
        responseFactory.propagateError(next, errors.SERVER_ERROR, err);
    }
});

router.patch('/activate/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const userId = await redisClient.get(code);
        await pgDb.task(connection => {
            return connection.none(queries.ACTIVATE_USER, {userId})
        });
        redisClient.del(code);
        responseFactory.buildSuccessResponse(res, 201);
    } catch (err) {
        responseFactory.propagateError(next, errors.SERVER_ERROR, err);
    }
});

router.patch('/password/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const userId = await redisClient.get(code);
        await pgDb.task(connection => {
            return connection.none(queries.CHANGE_PASSWORD,
                Object.assign({userId}, encryption.encryptPassword(req.body.password)));
        });
        redisClient.del(code);
        responseFactory.buildSuccessResponse(res, 201);
    } catch (err) {
        responseFactory.propagateError(next, errors.SERVER_ERROR, err);
    }
});

module.exports = router;