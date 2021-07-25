import React, { Component } from 'react';
import Layout from '../../hoc/layout';
import {getRecommendPost} from '../../actions/user_action';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { GridDots, Tag, Dots, CircleX, Heart, Message2 } from 'tabler-icons-react'
import CircularProgress from '@material-ui/core/CircularProgress';

class Explore extends Component {

    state={
        limit: 6,
        skip: 0,
        isloading: false,
    }

    constructor(props) {
        super(props);
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentDidMount(){
        this.props.dispatch(getRecommendPost(this.state.limit, this.state.skip));
        window.addEventListener("scroll", this.handleScroll);
    }

    handleScroll() {
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = Math.ceil(windowHeight + window.pageYOffset);
        console.log(docHeight,windowBottom)
        if (windowBottom >= docHeight) {
            if (this.props.user.recommendedPostSize == this.state.limit){
                console.log("bottom reachhhhhhhhhhhhhhhh")
                this.setState({isloading: true},()=>{this.LoadmoreCards()});
            }
        }
    }

    LoadmoreCards = () => {
        let skip = this.state.skip + this.state.limit;
        this.props.dispatch(getRecommendPost(
            this.state.limit,
            skip,
            this.props.user.recommendedPost
        ))
        .then(() => {
            this.setState({
                skip,
                isloading: false,
            })
        })
    }

    render() {
        const posts = this.props.user.recommendedPost;
        return (
            <Layout>
                <div className="Profile" onScroll={(event) => this.handleScroll(event)}>
                <div className="profile_container">
                <div className="profile_wrapper">
                 <div className="row body">
                    {
                        posts ? posts.map(post => {
                            return post.hidden ? null :
                                (
                                    <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 image_contain" onClick={()=>this.props.history.push(`/postDetail/${post._id}`)}>
                                    <div className="img_overlay">
                                        <div className="overlay_info">
                                            <div className="hearts">  <Heart size={24} strokeWidth={1} color="white" fill="white"></Heart><h2>{post.likes.length}</h2> </div>
                                            <div className="comments">  <Message2 size={24} strokeWidth={1} color="white" fill="white"></Message2><h2>{post.comments.length} </h2></div>
                                        </div>
                                    </div>
                                    <img src={post.images[0].url}></img>
                                </div>
                            )
                        }) : ""
                    }
                    {
                        this.props.user.recommendedPostSize > 0 && this.props.user.recommendedPostSize >= this.state.limit && this.state.isloading ?
                            <div className="load_more_container">
                                <CircularProgress style={{ color: '#5477D5' }} thickness={7} />
                            </div>
                        :null
                    }
                </div>
                </div>
                </div>
                </div>
            </Layout>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
    }
}
export default connect(mapStateToProps)(withRouter(Explore));
