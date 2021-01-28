import React, { Component } from 'react';
import Header from '../components/Header_Footer/Header';
import Footer from '../components/Header_Footer/Footer';

class Layout extends Component {
    render() {
        return (
            <div>
            {/* <Header/> */}
                <div className="page_container">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default Layout;