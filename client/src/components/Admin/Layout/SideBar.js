import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import './SideBar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faCog from '@fortawesome/fontawesome-free-solid/faCog';
import { logoutUser } from '../../../actions/user_action'
import { AlertOctagon , User } from 'tabler-icons-react'

class SideBar extends Component {

    logoutHandler = () => {
        this.props.dispatch(logoutUser())
            .then(response => {
                if (response.payload.success) {
                    this.props.history.push('/Admin/login')
                }
            })
    }

    render() {
        return (
            <div className="sidebar">
                <div className="logo">
                    <img className="stunning_logo" src={require('../../../asset/login-page/logo2x.png')} />
                    <img className="stunning_text" src={require('../../../asset/login-page/stun2x.png')} />
                </div>
                <div className="tools">
                    <h5>Công cụ quản lý</h5>
                    <ul>
                        <li className={this.props.page == "report" ? "active" : ""} onClick={() => this.props.history.push("/Admin/Dashboard")}>
                            <AlertOctagon size={20} strokeWidth={3} color="black" /> 
                            <p>Quản lý báo cáo </p>
                        </li>
                        <li className={this.props.page == "account"? "active" : ""} onClick={() => this.props.history.push("/Admin/Account")}>
                            <User size={20} strokeWidth={3} color="#8a8a8a" />
                            <p>Quản lý admin</p>
                        </li>
                        {/* <li className={this.props.page == "policy"? "active" : ""} onClick={() => this.props.history.push("/Admin/policy")}>
                        <p>Quản lý chính sách</p></li> */}
                    </ul>
                </div>
                <div className="info">
                    <div className="wrapper" onClick={() => this.props.history.push("/Admin/EditAccount")}>
                        <img className="avt" src="https://dep365.com/wp-content/uploads/2019/09/baifern-1200x1298.jpg" />
                        <p className="name" >Đăng Huy</p>
                    </div> 
                    <div className="logout">
                        <FontAwesomeIcon icon={faCog} />
                        <Link key={1} onClick={this.logoutHandler}>Log out</Link>
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

export default connect( mapStateToProps)(withRouter(SideBar));