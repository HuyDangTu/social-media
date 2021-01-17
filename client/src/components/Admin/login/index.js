import React from 'react';
import Login from './login';
import './login.scss';

const AdminLogin = () => {
    return (
        <div className="login">
            <div className="Admin_login__container">
                <div className="row no-gutters">
                    <div className="col-xl-3 col-lg-3 col-md-3 no-gutters">
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 no-gutters">
                        <div className="right">
                            <Login />
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-3 col-md-3 no-gutters">
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;