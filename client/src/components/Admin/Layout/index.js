import React, { Component } from 'react';
import { connect } from 'react-redux';
import SideBar from './SideBar';
import './layout.scss';

class Layout extends Component {
    render() {
        return (
            <div className="layout container-fluid ">
                <div className="row wrapper no-gutters">
                    <div className="col-xl-3 no-gutters sideBar">
                        <div className="sideBar_wrapper">
                            <SideBar page={this.props.page} />
                        </div>
                    </div>
                    <div className="col-xl-9 no-gutters">
                        <div className="page_container">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {

    };
}
export default connect(
    mapStateToProps,
)(Layout);