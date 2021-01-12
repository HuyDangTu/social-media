import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Tag.scss'
import Layout from '../../hoc/layout';
import { getTag, followTag, unfollowTag} from '../../actions/tag_actions';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Link, withRouter } from 'react-router-dom';

class Tag extends Component {

    state = {
        id: "",
        skip: 0, 
        limit: 6,
        isLoading: false,
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        this.setState({
            id: id
        })
        this.props.dispatch(getTag(id,this.state.skip, this.state.limit, []))
    }

    followTag(id,previousState) {
        this.props.dispatch(followTag(id, previousState));
    }

    unfollowTag(id, previousState) {
        this.props.dispatch(unfollowTag(id, previousState));
    }

    LoadmoreCards = () => {
        let skip = this.state.skip + this.state.limit;
        this.props.dispatch(getTag(
            this.state.id,
            this.state.skip,
            this.state.limit
        ))
        .then(() => {
            this.setState({
                isLoading: false,
                skip
            })
        })
    }

    handleScroll() {
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = Math.ceil(windowHeight + window.pageYOffset);
        console.log(windowBottom, docHeight, windowHeight)
        if (windowBottom >= docHeight) {
            this.setState({isLoading: true});
            this.LoadmoreCards()
            console.log('bottom reached');
        }
    }

    render() {
        const tag = this.props.tags.tag;
        return (
            this.props.tags.tag?
            <Layout>
            <div className="TagPage" onScroll={(event) => this.handleScroll(event)}>
                <div className="tag_info">
                    <div className="tag_image">
                        {
                            tag.posts.length ?
                            <img className="img" src={tag.posts[0].images[0].url} />
                            :
                            <img className="img" src="https://kazcm.com/wp-content/uploads/2018/02/Hashtag.jpg" /> 
                        }
                    </div>
                  
                        <div className="tag_name">
                            <h3>#{tag.tag.name}</h3>
                            <h6>{tag.posts.length} Bài viết</h6>
                        </div>
                        {
                            tag.tag.followers.includes(this.props.user.userData._id)
                            ?
                            <div className="button_wrapper">
                                    <button type="button" onClick={() => this.unfollowTag(tag.tag._id,this.props.tags.tag)}>Unfollow</button>
                                </div>
                            :  <div className="button_wrapper"> 
                                    <button type="button" onClick={() => this.followTag(tag.tag._id, this.props.tags.tag)}>Follow</button>
                                </div>
                        }
                   
                </div>
                <div className="posts">
                    <div className="row">
                        {
                        tag.posts.map((item)=>{
                            return (
                                <div className="col-xl-4 col-md-4  pb-3 pt-3 ">
                                <div className="image-wrapper" onClick={()=>{
                                        this.props.history.push(`/postDetail/${item._id}`)
                                }} style={{backgroundImage: `url(${item.images[0].url})`}}>
                                    
                                </div>
                            </div>)
                        })
                        }
                    </div>
                </div>
                {
                    this.state.isLoading ?
                    <div className="main_loader" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translateX(-50 %) translateY(- 50 %)'
                    }}>
                        <CircularProgress style={{ color: '#5477D5' }} thickness={7} />
                    </div>
                    :""
                }
            </div>
            </Layout>
            : ""
        );
    }
}
function mapStateToProps(state) {
    return {
        user: state.user,
        tags: state.tags,
    };
}
export default connect(mapStateToProps)(withRouter(Tag));