import React from 'react';

import Login from './login';
import './login.scss';

const RegisterLogin = () => {
    return (
        <div className="login">
            <div className="login__container">
                <div className="row no-gutters">
                    <div className="col-xl-6 col-lg-6 col-md-6 no-gutters">
                        <div className="left">
                            <div className="login_slogan">
                                <img className="logo" src='./images/landingPage/logoIcon2x.png' />
                                <h1>Share</h1>
                                <h1>your</h1>
                                <h1>feeling</h1>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 no-gutters">
                        <div className="right">
                            <Login />
                        </div>  
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterLogin;