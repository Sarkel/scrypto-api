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
    INSERT_CURRENCY: 'INSERT INTO scrypto.sc_currency(name) VALUES(${name});',
    GET_ACTIVE_USER_BY_EMAIL: 'SELECT u.id, u.email, u.password, u.name, u.seed FROM scrypto.sc_user AS u WHERE u.email = ${email} AND u.active = true;',
    CREATE_USER: 'INSERT INTO scrypto.sc_user(email, password, seed, name) VALUES(${email}, ${password}, ${seed}, ${name});',
    GET_USER_BY_EMAIL: 'SELECT u.id FROM scrypto.sc_user AS u WHERE u.email = ${email};',
    ACTIVATE_USER: 'UPDATE scrypto.sc_user AS u SET u.active = true WHERE u.id = ${userId};',
    CHANGE_PASSWORD: 'UPDATE scrypto.sc_user AS u SET u.password = ${password}, u.seed = ${seed} WHERE u.id = ${userId} AND u.active = true;'
};

module.exports = queries;