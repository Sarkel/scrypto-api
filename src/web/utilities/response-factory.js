/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
const moment = require('moment');

const utilities = {
    buildResponse: (success, data) => {
        return Object.assign({
                success,
                time: moment().format()
            },
            data
        );
    },
    buildSuccessResponse: (res, status, payload = null) => {
        res.status(status).json(utilities.buildResponse(true, {payload}));
    },
    buildErrorResponse: (res, err) => {
        res.status(err.status || 500).json(utilities.buildResponse(false, {error_message: err.message}));
    },
    propagateError: (next, details, parentError = null) => {
        if (parentError) {
            console.error(parentError);
        }
        const err = new Error();
        err.status = details.status;
        err.message = details.message;
        next(err);
    }
};

module.exports = utilities;