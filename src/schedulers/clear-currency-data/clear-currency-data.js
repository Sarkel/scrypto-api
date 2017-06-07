/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 08/06/2017
 * @Description
 */

'use strict';
const {Logger} = require('../../lib/logger');
const pgDb = require('../../lib/database');

const CLEAR_OLD_CURRENCY_DATA = 'SELECT scrypto.clear_old_currency_data()';

class ClearCurrencyData {
    constructor() {
        this._pgDb = pgDb;
        this._logger = Logger.getInstance();
    }

    async run() {
        try {
            this._logger.info('Cleanup start');
            // todo: retrieve all old records and send them to other db
            await this._pgDb.task(conn => conn.any(CLEAR_OLD_CURRENCY_DATA));
            this._logger.info('Cleanup end');
        } catch(e) {
            this._logger.error(e);
        }
    }
}

module.exports = {ClearCurrencyData};