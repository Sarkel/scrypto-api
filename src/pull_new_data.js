/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 23/04/2017
 * @Description
 */

'use strict';
const autobahn = require('autobahn'),
    db = require('./database'),
    _ = require('lodash');

const queries = {
        INSERT: 'INSERT INTO scrypto.sc_currency_data(rate, type, amount, sequence, name) VALUES(${rate}, ${type}, ${amount}, ${sequence}, ${name});',
        GET_ALL: 'SELECT name FROM scrypto.sc_currency;'
    },
    fields = ['rate', 'type', 'amount'].sort();

const apiConnection = new autobahn.Connection({
    url: 'wss://api.poloniex.com',
    realm: 'realm1'
});


function addNewCurrencyData(data, sequence, name) {
    db
        .tx(transaction => {
            const currenciesData = (data || []).map(value => {
                return value.data;
            });
            let records = [];
            currenciesData.forEach(value => {
                if (_.isEqual(Object.keys(value).sort(), fields)) {
                    records.push(
                        transaction.manyOrNone(queries.INSERT, Object.assign(value, {sequence: sequence.seq, name}))
                    );
                }
            });
            return transaction.batch(records);
        })
        .catch(err => {
            console.error(err);
        });
}

apiConnection.onopen = function (session) {
    let subscriptions = [];

    db
        .task(transaction => {
            return transaction.manyOrNone(queries.GET_ALL);
        })
        .then(function success(currencies) {
            const dbCurrencies = (currencies || []).map(value => {
                return value.name;
            });
            dbCurrencies.forEach(value => {
                session.subscribe(value, (data, sequence) => {
                    addNewCurrencyData(data, sequence, value);
                });
                subscriptions.push(value);
            });
        })
        .catch(err => {
            console.error(err);
        });
    db
        .connect({direct: true})
        .then(connection => {
            connection.client.on('notification', notificationData => {
                const payload = JSON.parse(notificationData.payload);
                session.subscribe(payload.name, (data, sequence) => {
                    addNewCurrencyData(data, sequence, payload.name);
                });
            });
            return connection.none('LISTEN $1~', 'new_currency');
        })
        .then(() => {
            console.log('Created listener');
        })
        .catch(err => {
            console.error(err);
        });
};

apiConnection.onclose = err => {
    console.error(err);
    console.log('Closed');
};

apiConnection.open();