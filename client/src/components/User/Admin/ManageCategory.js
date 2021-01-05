import React, { Component } from 'react';
import Layout from '../../../hoc/layout';
import ManageBrands from './ManageBrands';
import ManageWoods from './ManageWoods';

class ManageCategory extends Component {
    render() {
        return (
            <Layout>
                <ManageBrands/>
                <ManageWoods/>
            </Layout>
        );
    }
}

export default ManageCategory;