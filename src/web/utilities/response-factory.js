/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
const moment = require('moment');


function buildResponse(success) {
    return {
        success,
        time: moment().format()
    }
}

const utilities = {
    buildSuccessResponse: (res, status, payload = null) => {
        res.status(status).json(Object.assign(buildResponse(true), {payload}));
    },
    buildErrorResponse: (res, err) => {
        res.status(err.status || 500).json(Object.assign(buildResponse(false), {error_message: err.message}));
    },
    propagateError: (next, details) => {
        const err = new Error();
        err.status = details.status;
        err.message = details.message;
        next(err);
    }
};

module.exports = utilities;