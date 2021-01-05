import React, { Component } from 'react';
import { connect } from 'react-redux';
import { search, loadmoreUser, loadmoreTag} from '../../actions/search_action';
import Layout from '../../hoc/layout';
import './searchPage.scss';
import CircularProgress from '@material-ui/core/CircularProgress';

class SearchPage extends Component {

    state={
        showUser: true,
        isLoading: false,

        userSkip: 0,
        userLimit: 3,
        userLoadmore: true,

        tagSkip: 0,
        tagLimit: 3,
        tagLoadmore: true,
    }

    componentDidMount(){
        const keyword = this.props.match.params.keyword;
        this.props.dispatch(search(keyword, this.state.userSkip, this.state.userLimit,{users:[],tags:[]})).then(response =>{
           if(response.payload.userSize<this.state.limit){
               this.setState({ userLoadmore: false})
           }
        })
    }

    switch = () =>{
        this.setState({showUser: !this.state.showUser});
    }

    loadmoreUser = () => {
        let skip = this.state.userSkip + this.state.userLimit;
        this.props.dispatch(loadmoreUser(
            this.props.match.params.keyword,
            skip,
            this.state.userLimit,
            this.props.search
        )).then((response) => {
            if (response.payload.userSize < this.state.userLimit) {
                this.setState({ userLoadmore: false })
            }
            this.setState({
                isLoading: false,
                userSkip: skip
            })
        })
    }

    loadmoreTag = () => {
        let skip = this.state.tagSkip + this.state.tagLimit;
        this.props.dispatch(loadmoreTag(
            this.props.match.params.keyword,
            skip,
            this.state.tagLimit,
            this.props.search
        )).then((response) => {
            if (response.payload.tagSize < this.state.tagLimit) {
                this.setState({ tagLoadmore: false })
            }
            this.setState({
                isLoading: false,
                tagSkip: skip
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
            this.setState({ isLoading: true });
            this.Loadmore();
            console.log('bottom reached');
        }
    }

    render() {
        const search = this.props.search;
        return (
            <Layout>
                <div className="searchPage" >
                    <div className="wrapper">
                        <div className="row">
                            <div className="col-xl-3 col-3">
                                <div className="filter_button">
                                    <ul>
                                        <li className={this.state.showUser?"actived":""} onClick={this.switch} >Tài khoản</li>
                                        <li className={this.state.showUser ? "" :"actived"} onClick={this.switch}>Thẻ</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-xl-9 col-9">
                                {
                                    this.props.search.users && this.props.search.tags?
                                        <div className="result">
                                            {
                                                this.state.showUser?
                                                <div>{
                                                        search.users.map((item, idx)=>{
                                                            return(
                                                                <div className="item" key={idx}>
                                                                    <div className="user_infor_wrapper">
                                                                        <img src={item.avt} />
                                                                        <p>{item.userName}</p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                    {
                                                        this.state.userLoadmore ?
                                                        <button className="loadMoreButton" onClick={()=>this.loadmoreUser()}>Loadmore</button>
                                                        : ""
                                                    }
                                                </div>:
                                                <div>{
                                                    search.tags.map((tag, idx) => {
                                                        return (
                                                            <div className="item" key={idx}>
                                                                <div className="tag_infor_wrapper">
                                                                    <h6>#{tag.name}</h6>
                                                                    <p>{tag.posts.length} Bài viết</p>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                    }
                                                    {
                                                        this.state.tagLoadmore ?
                                                            <button className="loadMoreButton" onClick={() => this.loadmoreTag()}>Loadmore</button>
                                                        : ""
                                                    }
                                                </div>
                                            }
                                           
                                        </div>
                                    :
                                    "loading"
                                }

                            </div>
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
                            : ""
                    }
                </div>
            </Layout>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        search: state.search,
    };
}

export default connect(mapStateToProps,)(SearchPage);