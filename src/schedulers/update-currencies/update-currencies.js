/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 21/04/2017
 * @Description
 */

'use strict';
const request = require('request-promise'),
    _ = require('lodash'),
    options = {
        method: 'GET',
        uri: 'http://www.poloniex.com/public?command=returnTicker',
        json: true
    },
    queries = require('../../lib/queries');

function compareCurrencies(remoteCurrencies) {
    const db = require('../../lib/database');
    db
        .task(transaction => {
            return transaction.manyOrNone(queries.GET_ALL_CURRENCY);
        })
        .then(results => {
            let dbCurrencies = (results || []).map(value => {
                return value.name;
            });
            return db.tx(transaction => {
                let records = [];
                _.difference(Object.keys(remoteCurrencies), dbCurrencies)
                    .forEach(name => {
                        records.push(
                            transaction.manyOrNone(queries.INSERT_CURRENCY, {name})
                        );
                    });
                return transaction.batch(records);
            });
        })
        .then(() => {
            console.log('inserted');
            process.exit();
        })
        .catch(err => {
            console.error(err);
            process.exit();
        });
}

function onError(err) {
    console.error(err);
}

function updateCurrencies() {
    request(options)
        .then(compareCurrencies)
        .catch(onError);
}

module.exports = updateCurrencies;