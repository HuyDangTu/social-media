import React, {Component} from 'react'
import {connect} from 'react-redux';
import { getPostDetail, clearPostDetail } from '../../actions/product_actions';
import { Link, withRouter } from 'react-router-dom';
import PostDetailCard from './PostDetailCard';
import Layout from '../../hoc/layout';

class PostDetail extends Component {
    
    componentDidMount(){
        const id = this.props.match.params.id;
        console.log(id);
        this.props.dispatch(getPostDetail(id));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.key !== this.props.location.key) {
            const id = this.props.match.params.id;
            console.log(id);
            this.props.dispatch(getPostDetail(id));
        }
    }


    message(){
        return "sorry! post not found"
    }

    render(){
            return (
                <Layout>
                    <div className="container">
                        {
                            this.props.products.postDetail?
                                    <div className="product_detail_wrapper">
                                        <PostDetailCard post={this.props.products.postDetail} 
                                        />
                                    </div>
                            : "LOADING....."
                        }
                    </div>
                </Layout>
            )
        }
}

const mapStateToProps = (state) => {
    return {
        products: state.products,

    }
}
export default connect(mapStateToProps)(withRouter(PostDetail));