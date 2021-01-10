import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Layout from './layout';
import './user.scss'
import MyButton from '../components/ultils/button'

const links = [
    {
        name: 'My account',
        linkTo: '/user/dashboard'
    },
    {
        name: 'User information',
        linkTo: '/user/user_profile'
    },
    {
        name: 'My Cart',
        linkTo: '/user/cart'
    },
];

const admin = [
    {
        name: 'Site info',
        linkTo: '/admin/site_info'
    },
    {
        name: 'Add products',
        linkTo: '/admin/add_product'
    },
    {
        name: 'Manage',
        linkTo: '/admin/manage_categories'
    },
];
const UserLayout = (props) => {

    return (
        <Layout>
            <div className="userLayout">
                <div className="userLayout_container">
                    <div className="row">
                    <div>
                        {/* <div className="col-xl-3">
                            <div className="userLayout_left_nav">
                                <div>
                                    <h2>User information</h2>
                                    <div className="links">
                                        <span>{props.user.userData.name} </span>
                                        <span>{props.user.userData.lastname} </span>
                                        <span>{props.user.userData.email} </span>
                                    </div>
                                    <MyButton
                                        type="default"
                                        title="Edit account info"
                                        linkTo="/user/user_profile" />
                                </div>
                                <div>
                                <h2>My Account</h2>
                                <div className="links" style={{ height: '100px' }}>
                                    {
                                        links.map((item, i) => {
                                            return (
                                                <Link to={item.linkTo} key={i}>
                                                    {item.name}
                                                </Link>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                                {
                                props.user.userData.isAdmin ?
                                    <div>
                                        <h2>Admin</h2>
                                            <div className="links">{
                                            admin.map((item, i) => {
                                                return (
                                                    <Link to={item.linkTo} key={i}>
                                                        {item.name}
                                                    </Link>
                                                )
                                            })
                                        }</div>
                                    </div>
                                : null
                                }
                                <div>
                                    <h2>History purchased</h2>
                                    <div className="links" >
                                        History
                                    </div>
                                </div>
                            </div>
                        </div> */}
                        </div>
                    <div className="col-xl-12 col-sm-12 col-12">
                        <div className="userLayout_right">
                            {props.children}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};


const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(UserLayout);