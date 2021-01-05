import React, { Component } from 'react';

import {connect} from 'react-redux'
import {getProductsByArrival, getProductsBySell} from '../../actions/product_actions'

import './home.scss';
import { Link, withRouter } from 'react-router-dom';

class Home extends Component {
    
    componentDidMount(){
        this.props.dispatch(getProductsBySell());
        this.props.dispatch(getProductsByArrival());
    }

    render() {
        return (
            <div className="Landing_page">
                <div className="Landing_page_wrapper">
                    <div className="row no-gutters">
                        <div className="col-xl-12 no-gutters">
                            <div className='logo_icon'>
                                <img src='./images/landingPage/logoIcon2x.png' alt="image"/>
                            </div>
                        </div>
                    </div>
                    <div className="landing_function_wrapper">
                    <div class="row no-gutters">
                        <div className="col-xl-12 no-gutters">
                            <div className="landing_button_wrapper">
                                <img src='./images/landingPage/logo2x.png' alt="image"/>
                                <h6>Cánh cửa kết nối bạn với thế giới</h6>
                                <button className="Signin_button">
                                        <Link to='/register_login' >ĐĂNG KÝ
                                        </Link>
                                </button>
                                <button className="Signup_button">
                                        <Link to='/register_login' >ĐĂNG NHẬP
                                    </Link>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="row no-gutters ">
                            <div className="col-xl-12 no-gutters">
                            <div className="landing_navigation">
                            <ul>
                                <li><a>Điều khoản</a></li>
                                <li><a>Quyền riêng tư</a></li>
                                <li><a>Ngôn ngữ</a></li>
                                <li><a>Hỗ trợ</a></li>
                            </ul>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>          
        );
    }
}
const mapStateToProps = (state) => {
    return {
        products: state.products
    }
}

export default connect(mapStateToProps)(withRouter(Home));