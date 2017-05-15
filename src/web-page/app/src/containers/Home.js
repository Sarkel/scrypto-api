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

class Home extends React.Component {
    render() {
        return (
            <div>
                <div>Home</div>
                {this.props.children}
            </div>
        );
    }
}

Home.propTypes = {
    children: PropTypes.element
};

export default connect()(Home);