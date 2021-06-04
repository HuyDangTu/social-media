import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import './SideBar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faCog from '@fortawesome/fontawesome-free-solid/faCog';
import { logoutUser } from '../../../actions/user_action'
import { AlertOctagon , User, Home2 } from 'tabler-icons-react'

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
                    <ul>
                        <li className={this.props.page == "home" ? "active" : ""} onClick={() => this.props.history.push("/Admin/Home")}>
                            <Home2 size={20} strokeWidth={3} color="black" /> 
                            <p>Trang chủ</p>
                        </li>
                        <li className={this.props.page == "report" ? "active" : ""} onClick={() => this.props.history.push("/Admin/Dashboard")}>
                            <AlertOctagon size={20} strokeWidth={3} color="black" /> 
                            <p>Quản lý báo cáo </p>
                        </li>
                        <li className={this.props.page == "account"? "active" : ""} onClick={() => this.props.history.push("/Admin/Account")}>
                            <User size={20} strokeWidth={3} color="black" />
                            <p>Quản lý admin</p>
                        </li>
                    </ul>
                </div>
                {
                    this.props.user.userData? 
                        <div className="info">
                            <div className="wrapper" onClick={() => this.props.history.push("/Admin/EditAccount")}>
                                <img className="avt" src={this.props.user.userData.avt} />
                                <p className="name" >{this.props.user.userData.name}</p>
                            </div> 
                            <div className="logout">
                                <FontAwesomeIcon icon={faCog} />
                                <Link key={1} onClick={this.logoutHandler}>Log out</Link>
                            </div>            
                        </div>
                    :""
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
    };
}

export default connect( mapStateToProps)(withRouter(SideBar));