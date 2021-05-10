import React, { Component } from 'react';
import Layout from '../../hoc/layout';
import './NotFoundPage.scss';

class NotFoundPage extends Component {
    render() {
        return (
            <Layout>
                <div className="NotFoundPage">
                    This page is unavailable
                </div>
            </Layout>
        );
    }
}

export default NotFoundPage;