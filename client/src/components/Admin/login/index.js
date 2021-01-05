import React from 'react';
import Login from './login';
import './login.scss';

const AdminLogin = () => {
    return (
        <div className="login">
            <div className="login__container">
                <div className="row no-gutters">
                    <div className="col-xl-3 no-gutters">
                    </div>
                    <div className="col-xl-6 no-gutters">
                        <div className="right">
                            <Login />
                        </div>
                    </div>
                    <div className="col-xl-3 no-gutters">
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;