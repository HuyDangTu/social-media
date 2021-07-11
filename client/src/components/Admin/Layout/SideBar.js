import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import './SideBar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faCog from '@fortawesome/fontawesome-free-solid/faCog';
import { logoutUser } from '../../../actions/user_action'
import { AlertOctagon , User, Home2, Settings } from 'tabler-icons-react'
import NativeClickListener from '../../ultils/NativeClickListener';

class SideBar extends Component {
    state = {
        dropdown: false,
    }

    logoutHandler = () => {
        this.props.dispatch(logoutUser())
        .then(response => {
            if (response.payload.success) {
                this.props.history.push('/Admin/login')
            }
        })
    }

    handleDropdown = () =>{
        this.setState({
            dropdown: !this.state.dropdown
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
                            <div className="wrapper">
                                <img className="avt" src={this.props.user.userData.avt} onClick={this.handleDropdown} />
                                {
                                    this.state.dropdown ?
                                    <NativeClickListener onClick={() => this.setState({ dropdown: false })}>
                                        <div className="dropdown" onClick={this.handleBodyClick}>
                                            <div className="user_navigation">
                                                <div>
                                                    <User size={22} strokeWidth={1.5} color="grey"></User>
                                                    <Link to={`/Admin/EditAccount`}>Profile</Link>
                                                </div>
                                                {/* <div>
                                                    <Settings size={22} strokeWidth={1.5} color="grey"></Settings>
                                                    <Link to={`/profilesettings`}>Setting</Link>
                                                </div> */}
                                            </div>
                                            <div className="logout">
                                                <Link onClick={this.logoutHandler}>Log out</Link>
                                            </div>
                                        </div>
                                    </NativeClickListener>
                                : null
                                }
                                <p className="name" onClick={() => this.props.history.push("/Admin/EditAccount")} >{this.props.user.userData.name}</p>
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