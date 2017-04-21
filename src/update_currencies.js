/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 21/04/2017
 * @Description
 */

'use strict';
const request = require('request-promise'),
    _ = require('lodash');

const options = {
    method: 'GET',
    uri: 'http://www.poloniex.com/public?command=returnTicker',
    json: true
};

const queries = {
    getAll: 'SELECT name FROM data_puller.dp_currency;',
    insert: 'INSERT INTO data_puller.dp_currency(name) VALUES(${name});'
};

function _compareCurrencies(remoteCurrencies) {
    const db = require('./database');
    db
        .task(task => {
            return task.manyOrNone(queries.getAll);
        })
        .then(results => {
            let dbCurrencies = (results || []).map(value => {
                return value.name;
            });
            return db.tx(transaction => {
                let records = [];
                _.difference(remoteCurrencies, dbCurrencies)
                    .forEach(value => {
                        records.push(
                            transaction.manyOrNone(queries.insert, {name: value})
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

function checkCurrencies() {
    request(options)
        .then(_compareCurrencies)
        .catch(err => {
            console.error(err);
        });
}

checkCurrencies();