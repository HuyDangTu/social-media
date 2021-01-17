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
        clearPostDetail, 
        unSavePost,
        savePost } 
        from '../../actions/product_actions';
import Avatar from '@material-ui/core/Avatar';
import { getTagId } from '../../actions/tag_actions';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import NativeClickListener from '../ultils/NativeClickListener';
import { Link, withRouter } from 'react-router-dom';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import Report from '../Report/Report';
import { getPolicy } from '../../actions/policy_actions';
import PostEdit from '../PostEdit/index';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

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

        showEditor: false,
        setSnack: false,
        SnackMess: "",

        tags: [],
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

        let hashtag = this.findHashtags(this.props.post.description)
        getTagId(hashtag).then((response) => {
            this.setState({ tags: [...response] });
        })

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
            lightbox: false
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
                        <b onClick={() => {
                            this.props.history.push(`/user/${item.postedBy[0]._id}`)
                        }}>{item.postedBy[0].userName}</b> {item.content}
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
                const saved = this.props.user.userData.saved.filter(item => item == this.props.post._id);
                return (
                    <div >
                        {
                            saved[0] ?
                                <img onClick={() => this.props.dispatch(unSavePost(this.props.post._id))}
                                src={require('../../asset/newfeed_page/like_icon2x.png')} />
                                : <img onClick={() => this.props.dispatch(savePost(this.props.post._id))}
                                src={require('../../asset/newfeed_page/store_icon2x.png')} />
                        }
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
            let tags = [];
            result.forEach((item) => {
                tags.push(item.slice(1));
            })
            return (tags);
        } else {
            return false;
        }
    }

    handleDescription(description, userTag) {
        //let hashtag = this.findHashtags(description)
        
        this.state.tags.forEach((item) =>
            description = description.replace('#' + item.name, `<a href="/tag/${item._id}">${"#" + item.name}</a>`)
        )
        if (userTag.length > 0) {
            description = description + "<b>- cùng với </b>"
        }
        userTag.forEach((item) => {
            description += `<a href="/user/${item._id}"}>@${item.userName}</a> `
        })
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
            handleSnackBar={(mess) => { this.handleSnackBar(mess) }}
            list={this.props.policies.policyList}
            closeReportForm = {()=>this.closeReportForm()}
        />
    }
    
    deletePost(){
        
    }

    closeEditor = () => {
        this.setState({ showEditor: !this.state.showEditor })
    }

    handleSnackBar = (mess) => {
        this.setState({ setSnack: true, SnackMess: mess})
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
                                        <Link to={`/user/${props.post.postedBy[0]._id}`}>{props.post.postedBy[0].userName}</Link>
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
                                                            <p className="delete_button" onClick={() => {
                                                                this.setState({
                                                                    showEditor: true,
                                                                    dropdown: false
                                                                })
                                                            }} >Sửa</p>
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
                                {
                                    this.state.showEditor?
                                    <PostEdit description={props.post.description} 
                                            close={this.closeEditor} 
                                            handleSnackBar={(mess) => { this.handleSnackBar(mess) }} 
                                            ActionType="detail" 
                                            userTag={props.post.userTag} 
                                            postId={props.post._id}/>
                                    :this.handleDescription(props.post.description,props.post.userTag)
                                }
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
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    open={this.state.setSnack}
                    onClose={() => this.setState({ setSnack: false })}
                    autoHideDuration={3000}>
                    <MuiAlert elevation={6} variant="filled" severity="success" message={this.state.SnackMess}>{this.state.SnackMess}</MuiAlert>
                </Snackbar>
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