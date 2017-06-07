/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 23/04/2017
 * @Description
 */

'use strict';
const {Connection} = require('autobahn');
const pgDb = require('../../lib/database');
const {Logger} = require('../../lib/logger');
const _ = require('lodash');

const GET_ALL_CURRENCY = 'SELECT name FROM scrypto.sc_currency;';
const CREATE_LISTENER = 'LISTEN $1~';
const INSERT_CURRENCY_DATA = 'SELECT scrypto.create_currecy_data($[rate], $[type], $[amount], $[sequence], $[name]);';

const CURRENCY_DATA_FIELDS = ['rate', 'type', 'amount'];

class NewDataPuller {
    constructor() {
        this._logger = Logger.getInstance();
        this._pgDb = pgDb;
        this._connection = new Connection({
            url: 'wss://api.poloniex.com',
            realm: 'realm1'
        });
    }

    _createSubscription(session, subscriptionId) {
        session.subscribe(subscriptionId, this._addNewCurrencyData.bind(this, subscriptionId));
    }

    async _addNewCurrencyData(name, data, sequence) {
        try {
            await this._pgDb.tx(tx => {
                const records = _.chain(data)
                    .filter(
                        value => _.every(
                            CURRENCY_DATA_FIELDS, currencyDataField => value.data.hasOwnProperty(currencyDataField)
                        )
                    )
                    .map(
                        value => tx.any(INSERT_CURRENCY_DATA, {
                            rate: _.toNumber(value.data.rate),
                            type: _.toString(value.data.type),
                            amount: _.toNumber(value.data.amount),
                            sequence: _.toString(sequence.seq),
                            name: _.toString(name)
                        })
                    )
                    .value();
                return tx.batch(records);
            });
        } catch (e) {
            this._logger.error(e);
        }
    }

    _onNewCurrency(notificationData) {
        if (notificationData.channel === 'new_currency') {
            const payload = JSON.parse(notificationData.payload);
            this._createSubscription(session, payload.name);
        }
    }

    async _onOpen(session) {
        try {
            const connection = await this._pgDb.connect({direct: true});

            const currencies = await connection.manyOrNone(GET_ALL_CURRENCY);
            (currencies || []).forEach(value => this._createSubscription(session, value.name));

            connection.client.on('notification', this._onNewCurrency);
            await connection.none(CREATE_LISTENER, 'new_currency');
            this._logger.info('Created listener');
            setTimeout(() => {
                process.exit();
            }, 600000);
        } catch (e) {
            this._logger.error(e);
        }
    }

    _onClose(err) {
        this._logger.error(err);
        this._logger.info('Closed');
    }

    open() {
        this._connection.onopen = this._onOpen.bind(this);
        this._connection.onclose = this._onClose.bind(this);
        this._connection.open();
    }
}

module.exports = {NewDataPuller};