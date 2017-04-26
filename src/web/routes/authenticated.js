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

router.post('/', (req, res, next) => {
    pgDb
        .task(connection => {
            return connection.oneOrNone(queries.GET_ACTIVE_USER_BY_EMAIL, {email: req.body.email});
        })
        .then(user => {
            if (user && encryption.comparePasswords(req.body.password, user.seed, user.password)) {
                responseFactory.buildSuccessResponse(res, 200, {
                    user_id: user.id,
                    name: user.name,
                    token: authenticationToken.getToken()
                });
            } else {
                responseFactory.propagateError(next, errors.INVALID_CREDENTIALS);
            }
        })
        .catch(err => {
            responseFactory.propagateError(next, errors.SERVER_ERROR, err);
        });
});

router.post('/register', (req, res, next) => {
    pgDb
        .task(connection => {
            return Promise.all([
                connection.none(queries.CREATE_USER, Object.assign({}, req.body, encryption.encryptPassword(req.body.password))),
                connection.one(queries.GET_USER_BY_EMAIL, {email: req.body.email})
            ]);
        })
        .then(results => {
            return email.sendVerificationCode(results[1]);
        })
        .then(() => {
            responseFactory.buildSuccessResponse(res, 201);
        })
        .catch(err => {
            responseFactory.propagateError(next, errors.SERVER_ERROR, err);
        });
});

router.post('/verification', (req, res, next) => {
    pgDb
        .task(connection => {
            return connection.oneOrNone(queries.GET_ACTIVE_USER_BY_EMAIL, {email: req.body.email});
        })
        .then(user => {
            return email.sendVerificationCode(user);
        })
        .then(() => {
            responseFactory.buildSuccessResponse(res, 200);
        })
        .catch(err => {
            responseFactory.propagateError(next, errors.SERVER_ERROR, err);
        });

});

router.patch('/activate/:code', (req, res, next) => {
    const code = req.params.code;
    redisClient
        .get(code)
        .then(userId => {
            return pgDb
                .task(connection => {
                    return connection.none(queries.ACTIVATE_USER, {userId})
                });
        })
        .then(() => {
            redisClient.del(code);
            responseFactory.buildSuccessResponse(res, 201);
        })
        .catch(err => {
            responseFactory.propagateError(next, errors.SERVER_ERROR, err);
        });
});

router.patch('/password/:code', (req, res, next) => {
    const code = req.params.code;
    redisClient
        .get(code)
        .then(userId => {
            return pgDb
                .task(connection => {
                    return connection.none(queries.CHANGE_PASSWORD, Object.assign({userId}, encryption.encryptPassword(req.body.password)))
                });
        })
        .then(() => {
            redisClient.del(code);
            responseFactory.buildSuccessResponse(res, 201);
        })
        .catch(err => {
            responseFactory.propagateError(next, errors.SERVER_ERROR, err);
        });
});

module.exports = router;