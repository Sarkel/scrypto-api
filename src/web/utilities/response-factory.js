/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
const moment = require('moment');
const {Logger} = require('./logger');

class ResponseFactory {
    _logger = Logger.getInstance();
    static _instance = new ResponseFactory();

    static _buildResponse(success, data) {
        return Object.assign({
                success,
                time: moment().format()
            },
            data
        );
    }

    static getInstance() {
        return ResponseFactory._instance;
    }

    buildSuccessResponse(res, status, payload = null) {
        this._logger.info('Success request');
        res.status(status).json(ResponseFactory._buildResponse(true, {payload}));
    }

    buildErrorResponse(res, err) {
        this._logger.error(err);
        res
            .status(err.getStatus() || 500)
            .json(
                ResponseFactory.buildResponse(
                    false,
                    {
                        error_message: err.getMessage()
                    }
                )
            );
    }

    propagateError(next, err) {
        this._logger.error('Error request');
        next(err);
    }
}

module.exports = {ResponseFactory};