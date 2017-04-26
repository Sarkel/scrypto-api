/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 23/04/2017
 * @Description
 */

'use strict';
const autobahn = require('autobahn'),
    db = require('../../lib/database'),
    _ = require('lodash'),
    queries = require('../../lib/queries'),
    fields = ['rate', 'type', 'amount'].sort();


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
                        transaction.manyOrNone(
                            queries.INSERT_CURRENCY_DATA,
                            Object.assign(value, {sequence: sequence.seq, name})
                        )
                    );
                }
            });
            return transaction.batch(records);
        })
        .catch(err => {
            console.error(err);
        });
}

function onOpen(session) {
    let subscriptions = [];

    db
        .task(transaction => {
            return transaction.manyOrNone(queries.GET_ALL_CURRENCY);
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
                if(notificationData.channel === 'new_currency') {
                    const payload = JSON.parse(notificationData.payload);
                    session.subscribe(payload.name, (data, sequence) => {
                        addNewCurrencyData(data, sequence, payload.name);
                    });
                }
            });
            return connection.none(queries.CREATE_LISTENER, 'new_currency');
        })
        .then(() => {
            console.log('Created listener');
        })
        .catch(err => {
            console.error(err);
        });
};

function onClose(err) {
    console.error(err);
    console.log('Closed');
}

function pullNewData() {
    const apiConnection = new autobahn.Connection({
        url: 'wss://api.poloniex.com',
        realm: 'realm1'
    });
    apiConnection.onopen = onOpen;
    apiConnection.onclose = onClose;
    apiConnection.open();
}

module.exports = pullNewData;