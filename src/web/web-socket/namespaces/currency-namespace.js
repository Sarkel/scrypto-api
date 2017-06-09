/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 09/06/2017
 * @Description
 */

'use strict';
const {BaseNamespace} = require('./base-namespace');
const {ServerError} = require('../../utilities/error-factory');

const CREATE_LISTENER = 'LISTEN $1~';

class CurrencyNamespace extends BaseNamespace {
    constructor(rootUri, io) {
        super(rootUri, io);
    }

    _getUri() {
        return '/currency';
    }

    build() {
        this._io.on('connection', async socket => {
            try {
                const connection = await this._pgDb.connect();
                connection.client.on('notification', (notificationData) => {
                    if (notificationData.channel === 'new_currency_data') {
                        this._responseFactory.buildSuccessMessage(
                            socket,
                            'new_currency_data',
                            JSON.parse(notificationData.payload)
                        );
                    }
                });
                await connection.none(CREATE_LISTENER, 'new_currency_data');
            } catch (e) {
                this._responseFactory.buildErrorMessage(socket, 'new_currency_data', new ServerError(e));
            }
        });
    }
}

module.exports = {CurrencyNamespace};

