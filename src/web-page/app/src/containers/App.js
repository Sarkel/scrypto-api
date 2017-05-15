/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 15/05/2017
 * @Description
 */

'use strict';
import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

class App extends React.Component {
    componentDidUpdate(prevProps) {
        // todo: update access check logic
        const { dispatch, redirectUrl } = this.props;
        const isLoggingOut = prevProps.isLoggedIn && !this.props.isLoggedIn;
        const isLoggingIn = !prevProps.isLoggedIn && this.props.isLoggedIn;

        if (isLoggingIn) {
            dispatch(navigateTo(redirectUrl))
        } else if (isLoggingOut) {
            // todo: redirect to login
            // todo: clear history
        }
    }

    render() {
        return this.props.children
    }
}

App.propTypes = {
    children: PropTypes.element,
    redirectUrl: PropTypes.string,
    isLoggedIn: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        isLoggedIn: state.loggedIn,
        redirectUrl: state.redirectUrl
    }
}

export default connect(mapStateToProps)(App);