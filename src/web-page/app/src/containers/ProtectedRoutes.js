/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 15/05/2017
 * @Description
 */

'use strict';
import React from "react";
import {connect} from "react-redux";
import {hashHistory} from "react-router";
import PropTypes from "prop-types";

class ProtectedRoutes extends React.Component {
    componentDidMount() {
        const { dispatch, currentURL, isLoggedIn } = this.props;
        if(isLoggedIn) {
            // todo: save current path
            hashHistory.replace('/login');
        }
    }

    render() {
        return this.props.isLoggedIn ? this.props.children : null;
    }
}

ProtectedRoutes.propTypes = {
    isLoggedIn: PropTypes.bool,
    currentURL: PropTypes.string,
    children: PropTypes.element
};

function mapStateToProps(state, ownProps) {
    return {
        isLoggedIn: state.loggedIn,
        currentURL: ownProps.location.pathname
    }
}

export default connect(mapStateToProps)(ProtectedRoutes);