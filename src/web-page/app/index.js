/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 03/05/2017
 * @Description
 */

'use strict';
import React from "react";
import ReactDOM from "react-dom";
import AppRouter from "./src/AppRouter";
import {Provider} from "react-redux";
import configureStore from "./src/configureStore";

const store = configureStore();

ReactDOM.render(
    <Provider store={store}>
        <AppRouter/>
    </Provider>,
    document.getElementById('root')
);