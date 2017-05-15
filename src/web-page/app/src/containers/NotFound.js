/**
 * @Author Sebastian Kubalski
 * @Email sebastian.kubalski@gmail.com
 * @Date Creation 15/05/2017
 * @Description
 */

'use strict';
import React from "react";
import {connect} from "react-redux";

class NotFound extends React.Component {
    render() {
        return (
            <div>Not Found</div>
        );
    }
}

export default connect()(NotFound);