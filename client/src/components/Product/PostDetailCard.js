import React, { Component } from 'react';
import MyButton from '../ultils/button';
import './postDetailCard.scss';
import ImageLightBox from '../ultils/ImageLightBox'
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faEllipsisH from '@fortawesome/fontawesome-free-solid/faEllipsisH';
import { likePost, 
        unlikePost, 
        makeComment, 
        hidePost, 
        likeComment, 
        unLikeComment, 
        deleteComment, 
        deletePost, 
        clearPostDetail } 
        from '../../actions/product_actions';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import NativeClickListener from '../ultils/NativeClickListener';
import { Link, withRouter } from 'react-router-dom';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import Report from '../Report/Report';
import { getPolicy } from '../../actions/policy_actions';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


class PostDetailCard extends Component {

    state = {
        buttons: [
            {
                name: 'Like',
                linkTo: '/',
            },
            {
                name: 'Comment',
                linkTo: '/postDetail',
            },
            {
                name: 'Pin',
                linkTo: '',
            },
        ],

        lightbox: false,
        lightboxImages: [],

        dropdown: false,
        commentAdvancedBtn: false,
        
        limit: 3,
        skip: 0,

        isReportFormShow: false,
        reportData: {},

        DialogShowing: false,
        dialogType : "",

        commentSelected: "",
    }

    componentDidMount() {
        if (this.props.post.images) {
            let lightboxImages = [];

            this.props.post.images.forEach(item => {
                lightboxImages.push(item.url)
            })

            this.setState({
                lightboxImages
            })
        }
        this.props.dispatch(getPolicy());
    }

    // componentWillUnmount() {
    //     this.props.dispatch(clearPostDetail());
    // }

    handlelightBox = () => {
        if (this.props.post.images) {
            this.setState({
                lightbox: true,
            })
        }

    }

    handlelightBoxClose = () => {
        this.setState({
            lightbox: false,
        })
    }

    renderCardImage(images) {
        if (images.length > 0) {
            return images[0].url;
        } else {
            return 'https://cdn.shopify.com/s/files/1/0013/3529/6118/products/Terracotta-Pot-6_Sansevieria-Zeylanica-6.jpg?v=1544979697';
        }
    }

    showUser = (users) => {
        return users.map((item, i) => (
            <Avatar className="userlike_avt" alt={item.userName} src={item.avt} />
        ))
    }

    showComments = (comments) => {
        let commentsToShow = [];
        if (comments[0].content) {
            for (let i = 0; i < this.state.limit; i++) {
                if (this.props.post.comments[i] && this.props.post.comments[i].content) {
                    commentsToShow.push(this.props.post.comments[i]);
                }
                else{
                    break;
                }
            }
        }
        return commentsToShow.map((item, i) =>
            item ?
                <div className="comment"
                    onMouseEnter={() => this.setState({ commentAdvancedBtn: item._id})}
                    onMouseLeave={() => this.setState({ commentAdvancedBtn: "" })}
                >
                    <div className="user_avt">
                        <img src={item.postedBy[0].avt} />
                    </div>
                    <div className="content">
                        <b>{item.postedBy[0].userName}</b> {item.content}
                        <p>
                            {item.likes.length} lượt thích
                        </p>
                    </div>
                    <div className="like_button">
                        {
                            item.likes[0] ? <img onClick={() => this.props.dispatch(unLikeComment(this.props.post._id,item._id))}
                            src={require('../../asset/newfeed_page/active_like_icon2x.png')} />
                            :
                            <img onClick={() => this.props.dispatch(likeComment(this.props.post._id, item._id))}
                            src={require('../../asset/newfeed_page/like_icon2x.png')} />
                        }
                        <div>
                        {
                            this.state.commentAdvancedBtn == item._id ? 
                            <img onClick={() => { this.setState(
                                {
                                    DialogShowing: true,
                                    dialogType: "commentHandle",
                                    commentSelected: item._id})}} 
                                src={require('../../asset/headerIcon/advance_button2x.png')}/>
                            :""
                        }
                        </div>
                    </div>
                </div>
            : null
        )
    }

    makeComment = (postId, event) => {
        event.preventDefault();
        console.log(postId, event.target[0].value);
        this.props.dispatch(makeComment(postId, event.target[0].value, "detail")).then(
            event.target[0].value = ""
        )
    }

    defaultLink = (item, i) => {
        switch (item.name) {
            case 'Like':
                const liked = this.props.post.likes.filter(item => item._id === this.props.user.userData._id);
                return (
                    <div>
                        {
                            liked[0] ? <img onClick={() => this.props.dispatch(unlikePost(this.props.post._id,"detail"))}
                            src={require('../../asset/newfeed_page/active_like_icon2x.png')} />
                            :
                            <img onClick={() => this.props.dispatch(likePost(this.props.post._id, "detail"))}
                            src={require('../../asset/newfeed_page/like_icon2x.png')} />
                        }
                    </div>
                )
            case 'Pin':
                return (
                    <div>
                        <img src={require('../../asset/newfeed_page/store_icon2x.png')} />
                    </div>
                )
        }
    }

    showLinks = () => {
        let list = [];
        return this.state.buttons.map((item, i) => {
            return this.defaultLink(item, i)
        })
    }

    toggleDropdown = (syntheticEvent) => {
        console.log('toggle dropdown')
        this.setState(prevState => ({ dropdown: !prevState.dropdown }))
    }

    handleBodyClick = (syntheticEvent) => {
        console.log('body click')
    }
    
    postedDate(day) {
        console.log(day);
        day = parseInt(day);
        console.log(typeof day)
        if (day < 30) {
            return day + " ngày";
        } else if (day <= 1 && day > 0.0417) {
            console.log(day);
            return (day * 24) + " giờ";
        } else if (
            day <= 0.0417) {
            console.log(day);
            return (day * 24 * 60) + " phút";
        }
    }

    findHashtags(Text) {
        var regexp = /\B\#\w\w+\b/g
        let result = Text.match(regexp);
        if (result) {
            return (result);
        } else {
            return false;
        }
    }

    handleDescription(description) {
        let hashtag = this.findHashtags(description)
        hashtag.forEach((item) =>
            description = description = description.replace(item, `<a href="http://localhost:3000/users/dashboard">${item}</a>`)
        )
        return <div dangerouslySetInnerHTML={{ __html: description }} />
    }
    
    confirmDialog(type){
        let template = "";
        switch (type) {
            case "commentHandle":
                template = (<div className="commentHandle">
                    {
                        this.props.post.postedBy[0]._id === this.props.user.userData._id ?
                            <div>
                                <p className="delete_button"
                                    onClick={() => {
                                        this.props.dispatch(deleteComment(this.props.post._id, this.state.commentSelected))
                                            .then(() => {
                                                this.setState({
                                                    DialogShowing: false,
                                                    commentSelected: ""
                                                })
                                            })
                                    }}
                                >Xóa</p>
                                <hr />
                                <p className="report_button"
                                    onClick={() => {
                                        this.setState({
                                            isReportFormShow: true,
                                            reportData: {
                                                reportType: "comment",
                                                post: this.props.post._id ,
                                                comment: this.state.commentSelected,
                                            }
                                        }) 
                                    }}
                                 >Báo cáo</p>
                            </div>
                        :
                        <div>
                            <p className="report_button" 
                                onClick={() => {
                                    this.setState({
                                        isReportFormShow: true,
                                        reportData: {
                                            reportType: "comment",
                                            post:this.props.post._id,
                                            comment: this.state.commentSelected,
                                        }
                                    })
                                }}>Báo cáo</p>
                        </div>
                    }
                </div>)
                break;
            case "deleteConfirm":
                template = (
                    <div className="deleteConfirm">
                        <h5> Bạn chắc chắn muốn xóa bài viết này?</h5>
                        <div className="btn_wrapper">
                            <p className="cancel_btn" onClick={()=>this.setState({ DialogShowing: false })}>Hủy</p>
                            <p className="confirm_btn" onClick={() => this.props.dispatch(deletePost(this.props.post._id))
                                .then(() => {
                                    this.props.history.push('/newfeed');
                                })}>Xóa</p>
                        </div>
                    </div>)
                break;
            default: 
                template = (<div></div>)
                break;
        }
        return <Dialog
            open={this.state.DialogShowing}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => { this.setState({ DialogShowing: false }) }}>
           {template}
        </Dialog>
    }
    
    closeReportForm = () =>{
        this.setState({
            isReportFormShow: false,
            reportData: {},
            DialogShowing: false,
        }) 
    }

    showReportForm(type){
        return <Report 
            isReportFormShow={this.state.isReportFormShow}
            reportData = {this.state.reportData}
            list={this.props.policies.policyList}
            closeReportForm = {()=>this.closeReportForm()}
        />
    }
    
    deletePost(){
        
    }

    render() {
        const props = this.props;
        return (
            <div className="detail_card">
                <div className="card_item_wrapper">
                        <div className="left"> 
                            <img onClick={() => this.handlelightBox()} className='item_image'
                                src={this.renderCardImage(props.post.images)}
                            />
                        </div>
                        <div className="right"> 
                            <div className="card_row">
                                <div className="user_info">
                                    <div className="avt">
                                        <img src={props.post.postedBy[0].avt} />
                                    </div>
                                    <div className="userName">
                                        {props.post.postedBy[0].userName}
                                        <p>{this.postedDate(props.post.dateDifference)}</p>
                                    </div>
                                </div>
                                <div className={`advance_button ${this.state.dropdown ? "active_dropbox" : ""}`}>
                                    <img onClick={this.toggleDropdown} src={require('../../asset/headerIcon/advance_button2x.png')} />
                                    {
                                        this.state.dropdown ?
                                            <NativeClickListener onClick={() => this.setState({ dropdown: false })}>
                                                <div className="dropdown" onClick={this.handleBodyClick}>
                                                    <div>
                                                        <p onClick={() => this.props.dispatch(hidePost(this.props.post._id,"detail"))
                                                            .then(() => {
                                                                this.props.history.push('/newfeed');
                                                            })
                                                       }>
                                                        Ẩn</p>
                                                    </div>
                                                    <hr />
                                                    {
                                                        props.post.postedBy[0]._id === this.props.user.userData._id ?
                                                            <div>
                                                            <p className="delete_button" onClick={()=>{this.setState({
                                                                DialogShowing: true,
                                                                dialogType: "deleteConfirm",
                                                            })}} >Xóa</p>
                                                            </div>
                                                            : <div>
                                                                <p className="report_button" 
                                                                    onClick={() =>{
                                                                        this.setState({
                                                                        isReportFormShow: true,
                                                                        reportData: { 
                                                                            reportType: "post",
                                                                            post: props.post._id,
                                                                        }
                                                                    })
                                                                }}>Báo cáo</p>
                                                            </div>
                                                    }

                                                </div>
                                            </NativeClickListener>
                                            : null
                                    }
                                </div>
                            </div>
                            <div className="description">
                                {this.handleDescription(props.post.description)}
                            </div>
                        
                            <div className="comment_list">
                                {
                                    this.showComments(props.post.comments)
                                }
                                {
                                    this.state.limit < props.post.comments.length ?
                                        <h6 onClick={()=>{this.setState({limit: this.state.limit+3})}} className="view_more_cmt">{`Xem thêm`}</h6>
                                    : null
                                }
                            </div>
                            <div className="card_function"> 
                                <div className="button_wrapper">
                                    {this.showLinks()}
                                </div>
                                <div className="likes">
                                    <AvatarGroup max={3}>
                                        {this.showUser(props.post.likes)}
                                    </AvatarGroup>
                                    {
                                        props.post.likes.length ?
                                            <p> Đã thích bài viết </p>
                                            : null
                                    }
                                </div>
                            <form className="comment_form" onSubmit={(event) => this.makeComment(props.post._id, event, "Detail")} >
                                    <div className="comment_input">
                                        <input placeholder="Nhập hình luận...." />
                                    </div>
                            </form>
                            </div>
                        </div>
                </div>
                {
                    this.state.lightbox ?
                    <ImageLightBox
                        id={props.post._id}
                        images={this.state.lightboxImages}
                        open={this.state.lightbox}
                        pos={0}
                        onclose={() => this.handlelightBoxClose()}
                    />
                    : null
                }
                {
                    this.confirmDialog(this.state.dialogType)
                }
                {
                    this.showReportForm()
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        policies: state.policies,
    }
}

export default connect(mapStateToProps)(withRouter(PostDetailCard));