/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 15/05/2017
 * @Description
 */

'use strict';
import React from "react";
import {connect} from "react-redux";

class ChangePassword extends React.Component {
    render() {
        return (
            <div>Change Password</div>
        );
    }
}

export default connect()(ChangePassword);