/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 27/04/2017
 * @Description
 */

'use strict';
const express = require('express'),
    router = express.Router(),
    pgDb = require('../../lib/database'),
    queries = require('../../lib/queries'),
    responseFactory = require('../utilities/response-factory'),
    redisClient = require('../../lib/redis'),
    errors = require('../utilities/errors');

router.get('/currencies', (req, res, next) => {
    pgDb
        .task(transaction => {
            return transaction.manyOrNone(queries.GET_ALL_FIRST_CURRENCY);
        })
        .then(currencies => {
            responseFactory.buildSuccessResponse(res, 200, currencies);
        })
        .catch(err => {
            responseFactory.propagateError(next, errors.SERVER_ERROR, err);
        });
});

router.get('/latest-currency-data', (req, res, next) => {
    pgDb
        .task(transaction => {
            return transaction.manyOrNone(queries.LATEST_CURRENCY_DATA);
        })
        .then(recentCurrencyData => {
            responseFactory.buildSuccessResponse(res, 200, recentCurrencyData);
        })
        .catch(err => {
            responseFactory.propagateError(next, errors.SERVER_ERROR, err);
        });
});

router.patch('/users/:id', (req, res, next) => {
    // TODO add user update logic
});

router.delete('/users/:code', (req, res, next) => {
    const code = req.params.code;
    redisClient
        .get(code)
        .then(userId => {
            return pgDb
                .task(connection => {
                    return connection.none(queries.DEACTIVATE_USER, {userId});
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

// router.ws('/current-currency-data', ws => {
//     pgDb
//         .connect({direct: true})
//         .then(connection => {
//             connection.client.on('notification', notificationData => {
//                 if(notificationData.channel === 'new_currency_data') {
//                     ws.send(responseFactory.buildResponse(true, {payload: JSON.parse(notificationData.payload)}));
//                 }
//             });
//             return connection.none(queries.CREATE_LISTENER, 'new_currency_data');
//         })
//         .then(() => {
//             ws.send(responseFactory.buildResponse(true, {message: 'Connected'}))
//         })
//         .catch(err => {
//             console.error(err);
//             ws.send(responseFactory.buildResponse(false)); // TODO Add error message
//         });
// });

module.exports = router;