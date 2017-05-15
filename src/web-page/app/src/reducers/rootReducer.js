/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 15/05/2017
 * @Description
 */

'use strict';
import { combineReducers } from 'redux';

function test(state = { }, action) {
    switch (action.type) {
        default:
            return state
    }
}

const rootReducer = combineReducers({test});

export default rootReducer;