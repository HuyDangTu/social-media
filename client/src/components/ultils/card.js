import React, { Component } from 'react';
import './card.scss';
import ImageLightBox from './ImageLightBox'
import {connect} from 'react-redux';
import {likePost, unlikePost, makeComment, hidePost, deletePost, savePost, unSavePost} from '../../actions/product_actions';
import { unfollow, follow } from '../../actions/user_action';
import { getTagId } from '../../actions/tag_actions';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import NativeClickListener from '../ultils/NativeClickListener';
import { Link, withRouter } from 'react-router-dom';
import Report from '../Report/Report';
import { getPolicy } from '../../actions/policy_actions';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import PostEdit from '../PostEdit/index';
import { Button} from '@material-ui/core';
import {CircleX } from 'tabler-icons-react';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class  Card extends Component {
    
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

        reportData: {},

        tags: [],

        DialogShowing: false,
        dialogType: "",

        showEditor: false,

        reportData: {},
        setSnack: false,

        setfollowerDiaglog: false,
        alertFunctionIsRestricted: false,
    }

    componentDidMount() {
        if (this.props.images) {
            let lightboxImages = [];

            this.props.images.forEach(item => {
                lightboxImages.push(item.url)
            })
            this.setState({
                lightboxImages
            })
        }
        let hashtag = this.findHashtags(this.props.description)
        getTagId(hashtag).then((response)=>{
            this.setState({tags : [...response]});
        })
        this.props.dispatch(getPolicy());
    }

    handlelightBox = () => {
        if (this.props.images) {
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
        return users.map((item,i) => (
            <Avatar className="userlike_avt" alt={item.userName} src={item.avt} />
        ))
    }

    showComments = (comments) => {
        let commentsToShow = [];
        commentsToShow.push(comments[0]);
        commentsToShow.push(comments[1]);
        return commentsToShow.map((item, i) => 
            item ?   
            <div className="comment">
                <h6 onClick={() => {
                        this.props.history.push(`/user/${item.postedBy[0]._id}`)
                }}>{item.postedBy[0].userName}</h6> {item.content}
            </div>
            : null
        )
    }
    
    makeComment = (postId,event) => {
        event.preventDefault();
        console.log(postId, event.target[0].value);
        this.props.dispatch(makeComment(postId, event.target[0].value)).then(
            event.target[0].value = ""
        )
    }

    openEditor = () => {
        this.setState({ showEditor: !this.state.showEditor})
        this.toggleDropdown();
    }

    closeEditor = () => {
        this.setState({ showEditor: !this.state.showEditor })
    }
    
    handleClickunfollow = async (id) => {
        await this.props.dispatch(unfollow(id))
        this.props.handleSnackBar("Đã bỏ theo dõi");
    }

    handleClickfollow = async (id) => {
        await this.props.dispatch(follow(id))
        this.props.handleSnackBar("Đã theo dõi");
    }

    defaultLink = (item, i) => {
        switch(item.name){
            case 'Like':
                const liked = this.props.likes.filter(item => item._id === this.props.user.userData._id);
                return (
                    <div>
                        { 
                        liked[0] ? <img onClick={() => this.props.dispatch(unlikePost(this.props._id).then(response =>{
                            this.setState({alertFunctionIsRestricted: true})
                        }))}
                            src={require('../../asset/newfeed_page/active_like_icon2x.png')} /> 
                        : 
                        <img onClick={() => this.props.dispatch(likePost(this.props._id)).then(response =>{
                            this.setState({alertFunctionIsRestricted: true})
                        })} 
                            src={require('../../asset/newfeed_page/like_icon2x.png')} />  
                        }                      
                    </div>)
            case 'Comment':
                return (
                <div onClick={()=>{
                        this.props.history.push(`/postDetail/${this.props._id}`)
                    }}>
                        <img src={require('../../asset/newfeed_page/comment_icon2x.png')}/>
                </div>)
            case 'Pin':
                const saved = this.props.user.userData.saved.filter(item => item == this.props._id);
                console.log(saved);
                return (
                <div >
                    {
                    saved[0] ? 
                    <img onClick={() => this.props.dispatch(unSavePost(this.props._id))}
                            src={require('../../asset/newfeed_page/stored_icon2x.png')} />
                    :
                    <img onClick={() => this.props.dispatch(savePost(this.props._id))}
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
    
    postedDate(day){
        console.log(day);
        day = parseInt(day);
        console.log(typeof day)
        if(day==0){
            return "Hôm nay";
        }else if(day < 30){
            return day + " ngày";
        }else if (day > 30 ){
            console.log(day);
            return Math.floor((day/7))  + "tuần";
        }else if(day > 365) {
            console.log(day);
            return Math.floor((day / 365)) + "năm";
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


    findTagId = (tag) => {
        alert("tag");
    }

    handleDescription(description, userTag){
        console.log(this.state.tags)
        let hashtag =[];
        
        this.state.tags.forEach((item) =>
            description = description.replace('#'+item.name, `<a href="tag/${item._id}">${"#"+item.name}</a>`)
        )
        if(userTag.length > 0){
             description = description + "<b>- cùng với </b>"
        }
        userTag.forEach((item) =>{
            if(!this.props.user.userData.blockedUsers.includes(item._id))
                description += `<a href="/user/${item._id}"}>@${item.userName}</a> `
        })
        return <div dangerouslySetInnerHTML={{ __html: description }} />
    }

    closeReportForm(){
        this.setState({ 
            DialogShowing: false,
            reportData: {} 
        }) 
    }

    confirmDialog(type) {
        switch (type) {
            case "report": {
                return <Report
                    isReportFormShow={this.state.DialogShowing}
                    reportData={this.state.reportData}
                    list={this.props.policies.policyList}
                    handleSnackBar={(mess) => { this.props.handleSnackBar(mess)}}
                    closeReportForm={()=>this.closeReportForm()}
                />
            }
            case "delete":{
                return <Dialog
                    open={this.state.DialogShowing}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={() => { this.setState({ DialogShowing: false }) }}>
                    <div className="deleteConfirm">
                        <h5> Bạn chắc chắn muốn xóa bài viết này?</h5>
                        <div className="btn_wrapper">
                            <p className="cancel_btn" onClick={() => this.setState({ DialogShowing: false})}>Hủy</p>
                            <p className="confirm_btn" onClick={() => this.props.dispatch(deletePost(this.props._id))
                                .then((response) => {
                                    console.log(response)
                                    if(response.payload.success){
                                        this.props.handleSnackBar("Đã xóa bài viết")
                                        this.closeReportForm();
                                    }else{
                                        this.closeReportForm();
                                        alert("đã xãy ra lỗi")
                                    }
                                })}>Xóa</p>
                        </div>
                    </div>
                    </Dialog> 
                }
            default:{
                return <div></div>
            }
        }
    }

    setSnack = () =>{
        this.setState({ setSnack: true });
    }

    render() {
        const props = this.props;
        const userProfile = this.props.likes;
        const yourProfile = this.props.user.userData;
        return (
                <div className = {`${props.grid}`}>
                    <div className="card_item_wrapper">
                        <div className= 'card_action_container'>
                            <div className="card_row">
                                <div className="user_info">
                                    <div className="avt">
                                        <img src={props.postedBy[0].avt} />
                                    </div>
                                    <div className="userName">
                                        <Link to={`/user/${props.postedBy[0]._id}`}>{props.postedBy[0].userName}</Link>
                                        <p>{this.postedDate(props.dateDifference)}</p>
                                    </div>
                                </div>
                            <div className={`advance_button ${this.state.dropdown ? "active_dropbox" : ""}`}>
                                <img onClick={this.toggleDropdown} src={require('../../asset/headerIcon/advance_button2x.png')} />
                                {
                                    this.state.dropdown ?
                                    <NativeClickListener onClick={() => this.setState({ dropdown: false })}>
                                        <div className="dropdown" onClick={this.handleBodyClick}>
                                            <div>
                                                <p onClick={()=>this.props.dispatch(hidePost(this.props._id)).then(()=>{
                                                    this.props.handleSnackBar("Đã ẩn bài viết")
                                                })}>Ẩn</p>
                                            </div>
                                            <hr />
                                            <div>
                                                <Link to={`/postDetail/${this.props._id}`} >chi tiết bài viết</Link>
                                            </div>
                                            <hr />
                                            {
                                                props.postedBy[0]._id === this.props.user.userData._id ?
                                                <>
                                                    <hr />
                                                    <div>
                                                        <p onClick={this.openEditor}>Chỉnh sửa</p>
                                                    </div>
                                                </>
                                                :""
                                            }
                                            <hr />
                                            {
                                                props.postedBy[0]._id === this.props.user.userData._id ?
                                                <div>
                                                    <p className="delete_button" 
                                                        onClick={()=>
                                                        {this.setState({
                                                            DialogShowing: true,
                                                            dialogType: "delete", 
                                                        })
                                                        console.log(this.state.DialogShowing)}}>Xóa</p>
                                                </div>
                                                :<div>
                                                    <p className="report_button" 
                                                        onClick={()=>{this.setState({
                                                            DialogShowing: true,
                                                            dialogType: "report",
                                                            reportData: {
                                                                reportType: "post",
                                                                post: props._id,
                                                            }
                                                        })}}>Báo cáo</p>
                                                </div>
                                            }
                                        </div>
                                    </NativeClickListener>
                                    : null
                                }
                                </div>
                            </div>
                            {
                                this.state.showEditor ? 
                                <PostEdit description={props.description} close={this.closeEditor} handleSnackBar={(mess)=>{this.props.handleSnackBar(mess)}} ActionType="newFeed" userTag={props.userTag} postId={props._id}/>
                                :
                                <div className="description">
                                    {this.handleDescription(props.description,props.userTag)}
                                </div>
                            }
                            <img onClick={()=>this.handlelightBox()} className='item_image'
                            src={this.renderCardImage(props.images)}
                            />
                            <div className ="button_wrapper">
                                {this.showLinks()}
                            </div>
                            <div className="likes" onClick={() => { this.setState({ setfollowerDiaglog: true }) }}>
                                <AvatarGroup max={3}>
                                    {this.showUser(props.likes)}
                                </AvatarGroup>  
                                {
                                    props.likes.length ?
                                    <p> Đã thích bài viết </p>
                                    :null
                                }
                            </div>
                            <div className="comment_list">
                                {
                                    props.comments.length > 2 ?
                                    <h6 onClick={() => {
                                        this.props.history.push(`/postDetail/${this.props._id}`)
                                    }} className="view_more_cmt">{`Xem thêm bình luận`}</h6>
                                        : null
                                }
                                {
                                    props.comments[0].content ?
                                        this.showComments(props.comments)
                                    : null
                                }
                            </div>
                            <form className="comment_form" onSubmit={(event) => this.makeComment(props._id, event)} >
                                <div className="avt"> 
                                    <img src={props.user.userData.avt} />
                                </div>
                                <div className="comment_input">
                                    <input placeholder="Nhập hình luận...." />
                                </div>
                                <div className="send_button">
                               
                                </div>
                            </form>
                    </div>
                </div>
                <Dialog className="dialog_cont" onClose={() => { this.setState({ setfollowerDiaglog: false })} } open={this.state.setfollowerDiaglog}>
                    <div className="dialog_header">
                        <h5>Danh sách đang theo dõi</h5>
                        <CircleX size={24} strokeWidth={0.5} color="black" onClick={() => { this.setState({ setfollowerDiaglog: false })}} ></CircleX>
                    </div>
                    {
                        userProfile ? userProfile.map(item => {
                            return (
                                <div className="follow_list">
                                    <div className="list_info">
                                        <img src={item.avt}></img>
                                        <Link to={`/user/${item._id}`}> <h2>{item.userName}</h2></Link>
                                    </div>
                                    {
                                        yourProfile ? (yourProfile.followings.includes(item._id) ?
                                            <Button className="minibtn" onClick={() => this.handleClickunfollow(item._id)} > Đang theo dõi</Button>
                                            :
                                            <Button className="minibtn" onClick={() => this.handleClickfollow(item._id)}>Theo dõi</Button>
                                            )
                                        : null
                                    }
                                </div>
                            )
                        }) 
                        : ''
                    }
                </Dialog>

                <Dialog className="dialog_cont" 
                        onClose={() => { this.setState({ alertFunctionIsRestricted: false })}} 
                        open={this.state.alertFunctionIsRestricted} >
                    <div className="dialog_header">
                        <h5>Bạn đã bị hạn chế chức năng này trong vòng ... ngày</h5>
                    </div>
                </Dialog>

                {
                    this.state.lightbox ?
                        <ImageLightBox
                            id={props._id}
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

export default connect(mapStateToProps)(withRouter(Card));