/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 09/06/2017
 * @Description
 */

'use strict';
const pgDb = require('../../../lib/database');
const path = require('path');
const {Logger} = require('../../../lib/logger');
const {ResponseFactory} = require('../../utilities/response-factory');

class BaseNamespace {
    constructor(rootUri, io) {
        this._pgDb = pgDb;
        this._io = io.of(path.join(rootUri, this._getUri()));
        this._logger = Logger.getInstance();
        this._responseFactory = ResponseFactory.getInstance();
    }

    _getUri() {}
}

module.exports = {BaseNamespace};