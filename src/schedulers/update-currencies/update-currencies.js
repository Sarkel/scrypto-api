/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 21/04/2017
 * @Description
 */

'use strict';
const request = require('request-promise');
const _ = require('lodash');
const queries = require('../../lib/queries');
const db = require('../../lib/database');
const {Logger} = require('../../lib/logger');


const GET_ALL_CURRENCY = 'SELECT name FROM scrypto.sc_currency;';
const INSERT_CURRENCY = 'SELECT scrypto.create_currency($[name]);';

class UpdateCurrencies {
    constructor() {
        this._pgDb = db;
        this._logger = Logger.getInstance();
    }

    async run() {
        try {
            const currencies = await this._pgDb.task(conn => {
                return conn.manyOrNone(GET_ALL_CURRENCY);
            });
            const remoteCurrencies = await request({
                method: 'GET',
                uri: 'http://www.poloniex.com/public?command=returnTicker',
                json: true
            });
            let dbCurrencies = (currencies || []).map(value => {
                return value.name;
            });
            await db.tx(transaction => {
                const records = _.chain(remoteCurrencies)
                    .keys()
                    .difference(dbCurrencies)
                    .map(name => transaction.manyOrNone(INSERT_CURRENCY, {name}))
                    .value();
                return transaction.batch(records);
            });
        } catch(e) {
            this._logger.error(e);
        }
        process.exit();
    }
}

module.exports = {UpdateCurrencies};