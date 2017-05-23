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

router.get('/currencies', async (req, res, next) => {
    try {
        const currencies = await pgDb.task(transaction => {
                return transaction.manyOrNone(queries.GET_ALL_FIRST_CURRENCY);
            });
        responseFactory.buildSuccessResponse(res, 200, currencies);
    } catch (err) {
        responseFactory.propagateError(next, errors.SERVER_ERROR, err);
    }
});

router.get('/latest-currency-data', async (req, res, next) => {
    try {
        const recentCurrencyData = await pgDb.task(transaction => {
                return transaction.manyOrNone(queries.LATEST_CURRENCY_DATA);
            });
        responseFactory.buildSuccessResponse(res, 200, recentCurrencyData);
    } catch(err) {
        responseFactory.propagateError(next, errors.SERVER_ERROR, err);
    }
});

router.patch('/users/:id', async (req, res, next) => {
    // TODO: add user update logic
    responseFactory.buildSuccessResponse(res, 200);
});

router.get('/search', async (req, res, next) => {
    //TODO: add search logic
    responseFactory.buildSuccessResponse(res, 200);
});

router.delete('/users/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const userId = await redisClient.get(code);
        await pgDb.task(connection => {
                return connection.none(queries.DEACTIVATE_USER, {userId});
            });
        redisClient.del(code);
        responseFactory.buildSuccessResponse(res, 201);
    } catch (err) {
        responseFactory.propagateError(next, errors.SERVER_ERROR, err);
    }
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