/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 15/05/2017
 * @Description
 */

'use strict';
import React from "react";
import {connect} from "react-redux";

class Settings extends React.Component {
    render() {
        return (
            <div>Settings</div>
        );
    }
}

export default connect()(Settings);