/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 25/04/2017
 * @Description
 */

'use strict';
const queries = {
    INSERT_CURRENCY_DATA: 'INSERT INTO scrypto.sc_currency_data(rate, type, amount, sequence, name) VALUES(${rate}, ${type}, ${amount}, ${sequence}, ${name});',
    GET_ALL_CURRENCY: 'SELECT name FROM scrypto.sc_currency;',
    CREATE_LISTENER: 'LISTEN $1~',
    INSERT_CURRENCY: 'INSERT INTO scrypto.sc_currency(name) VALUES(${name});'
};

module.exports = queries;