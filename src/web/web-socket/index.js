/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 09/06/2017
 * @Description
 */

'use strict';
const socketIo = require('socket.io');
const {Logger} = require('../../lib/logger');
const {ResponseFactory} = require('../utilities/response-factory');
const {AuthenticationService} = require('../middlewares/authentication-service');
const {CurrencyNamespace} = require('./namespaces/currency-namespace');

class WebSocket {
    constructor(server) {
        this._server = server;
        this._responseFactory = ResponseFactory.getInstance();
        this._logger = Logger.getInstance();
        this._buildSocket();
        this._buildNamespace();
    }

    _buildSocket() {
        this._io = socketIo(this._server);
        this._io.set('origins', '*:*');
        this._io.use(AuthenticationService.authenticateSocket);
    }

    _buildNamespace() {
        new CurrencyNamespace(WebSocket._getUri(), this._io).build();
    }

    static _getUri() {
        return '/ws/v1'
    }
}
module.exports = {WebSocket};