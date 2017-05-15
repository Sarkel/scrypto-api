/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 15/05/2017
 * @Description
 */

'use strict';
import React from "react";
import {HashRouter, Route, Switch} from "react-router-dom";
import Login from "./containers/Login";
import Register from "./containers/Register";
import App from "./containers/App";
import ForgottenPassword from "./containers/ForgottenPassword";
import ProtectedRoutes from "./containers/ProtectedRoutes";
import Settings from "./containers/Settings";
import Search from "./containers/Search";
import Home from "./containers/Home";
import Currency from "./containers/Currency";
import Verification from "./containers/Verification";
import ChangePassword from "./containers/ChangePassword";
import NotFound from "./containers/NotFound";

class AppRouter extends React.Component {
    render() {
        return (
            <HashRouter hashType="slash" basename="/">
                <Route path="/" component={App}>
                    <Switch>
                        <Route path="/login" component={Login}/>
                        <Route path="/register" component={Register}/>
                        <Route path="/forgotten-password" component={ForgottenPassword}/>
                        <Route path="/verification" component={Verification}/>
                        <Route path="/change-password" component={ChangePassword}/>
                        <Route component={ProtectedRoutes}>
                            <Route path="/settings" component={Settings}/>
                            <Route path="/search/:searchString" component={Search}/>
                            <Route path="/" component={Home}>
                                <Route path="/:currencyName" component={Currency}/>
                            </Route>
                        </Route>
                        <Route component={NotFound}/>
                    </Switch>
                </Route>
            </HashRouter>
        );
    }
}

export default AppRouter;