import React, { Component}  from 'react';
import './StoryPage.scss';
import { connect } from 'react-redux';
import Stories from 'react-insta-stories';
import { getStory, viewStory, deleteStory} from '../../actions/product_actions';
import { replyStory } from '../../../src/actions/message_action'
import { withRouter } from 'react-router-dom';
import { Sticker, Send, PlayerPlay, PlayerPause, ArrowLeft,  ArrowRight } from 'tabler-icons-react'
import { Eye,Trash } from 'tabler-icons-react';
import { Picker } from 'emoji-mart'
import Reaction from '../Reaction/index';
import Slide from '@material-ui/core/Slide';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert'
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class StoryPage extends Component {

    state={
        storyId: "",
        currentDisplay: 0,
        previousStoryId: "", 
        storyToShow: null,
        nextStoryId: "",
        currentIndex: 0,
        startIndex: 0,
        end: -1,
        isStoryPlaying: true,
        content: '',
        mess: {
            sentTo: '',
            sentBy: '',
            content: '',
            type: 'replyStory',
            attachment:'',
        },
        sendSucess: false,
        message: "",
    }
    loadingStory = {
        url: "https://nguahanoi.vn/wp-content/themes/gv-coporation/images/default.jpg",
        header: ""
    }
    componentDidMount(){
        const id = this.props.location.state.id;
        this.setState({storiId:id});   
        this.props.dispatch(getStory(this.props.user.userData._id)).then(()=>{
            const storyToShow = this.props.products.storyList.find(element => element._id === id);
            const index = this.props.products.storyList.indexOf(storyToShow);
            // tìm vị trí stories cuối cùng chưa đc xem bởi người dùng, khi xem hết story này sẽ direct qua trang NewFeed
            let end = this.endPosition(this.props.products.storyList);
            console.log("END INDEX",end);
            // Vị trí story bắt đầu của storyToShow
            let startIndex = this.startIndex(storyToShow.stories)
            // Id của Stories tiếp theo
            let nextStoryId = -1;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
            if (index < this.props.products.storyList.length - 1) {
                nextStoryId = this.props.products.storyList[index + 1]._id;
            }
            let previousStoryId = 0;
            // Id của story phía trước
            if (index > 0) {
                previousStoryId = this.props.products.storyList[index - 1]._id;
            }
            this.setState({ 
                storyToShow: storyToShow,
                currentDisplay: index,
                nextStoryId: nextStoryId,
                startIndex: startIndex,
                previousStoryId: previousStoryId,
                end: end,
                mess: {
                    ...this.state.mess,
                    sentTo: this.props.products.storyList[index]._id,
                    sentBy: this.props.user.userData._id,
                    attachment: this.props.products.storyList[index].stories[this.state.startIndex]._id,
                }
            });
            // console.log(this.state.currentDisplay, this.state.storyToShow, this.state.nextStoryId);
        })
    }
    // tìm vị trí stories cuối cùng chưa đc xem bởi người dùng, khi xem hết story này sẽ direct qua trang NewFeed
    endPosition = (list) => {
        return list.findIndex(item => {
            return item.stories.findIndex(item => {
                return !item.viewedBy.some(item => item._id == this.props.user.userData._id)}) == -1
        })
    }

    startIndex = (stories) => { 
        let index = stories.findIndex(item => {return !item.viewedBy.includes(this.props.user.userData._id)});
        if(index === -1){
            return 0;
        }else{
            return index; 
        }
    }

    handleChange = (event) => {
        this.setState({mess: {...this.state.mess,content: event.target.value}});
    }
    nextStory = () => {
        try{
        if(this.state.nextStoryId!=-1)
        {
            const storyToShow = this.props.products.storyList.find(element => element._id === this.state.nextStoryId);
            const index = this.props.products.storyList.indexOf(storyToShow);
            if(index == this.state.end){
                this.props.history.push(`/newfeed`);
            }else{
                let startIndex = this.startIndex(storyToShow.stories)
                let nextStoryId = -1;
                if (index < this.props.products.storyList.length - 1) {
                    nextStoryId = this.props.products.storyList[index + 1]._id;
                }
                let previousStoryId = -1;
                if (index > 0) {
                    previousStoryId = this.props.products.storyList[index - 1]._id;
                }
                console.log(storyToShow,nextStoryId,index,previousStoryId)
                this.setState({
                    storyToShow: storyToShow,
                    nextStoryId: nextStoryId,
                    currentDisplay: index,
                    previousStoryId: previousStoryId,
                    startIndex: startIndex,
                    currentIndex: 0,
                    mess: {
                        ...this.state.mess,
                        sentTo: storyToShow._id,
                        sentBy: this.props.user.userData._id,
                        attachment: storyToShow.stories[startIndex]._id,
                    }
                });
            }
        }else{
            this.props.history.push(`/newfeed`);
        }
        }catch(err){
            console.log(err)
        }
    }
    previousStory = () => {
        try{
        if(this.state.previousStoryId!=-1)
        {
            const storyToShow = this.props.products.storyList.find(element => element._id === this.state.previousStoryId);
            const index = this.props.products.storyList.indexOf(storyToShow);
            // if(index == this.state.end){
            //     console.log("next story equals end index")
            //     // this.props.history.push(`/newfeed`);
            // }else{
                let startIndex = this.startIndex(storyToShow.stories)
                let nextStoryId = -1;
                if (index < this.props.products.storyList.length - 1) {
                    nextStoryId = this.props.products.storyList[index + 1]._id;
                }
                let previousStoryId = 0;
                if (index > 0) {
                    previousStoryId = this.props.products.storyList[index - 1]._id;
                }
                console.log(storyToShow,nextStoryId,index,previousStoryId)
                this.setState({
                    storyToShow: storyToShow,
                    nextStoryId: nextStoryId,
                    currentDisplay: index,
                    previousStoryId: previousStoryId,
                    startIndex: startIndex,
                    currentIndex: 0,
                    mess: {
                        ...this.state.mess,
                        sentTo: storyToShow._id,
                        sentBy: this.props.user.userData._id,
                        attachment: storyToShow.stories[startIndex]._id,
                    }
                });
            // }
        }else{
            console.log("next story equals -1")
            // this.props.history.push(`/newfeed`);
        }
        }catch(err){
            console.log(err)
        }
    }
    test = (obj) =>{
        console.log( "testttttttttttttttttt",
            obj.stories.map((item)=>{
                return {
                    url: item.image,
                    header: {
                    profileImage: this.state.storyToShow.postedBy[0].avt,
                    heading: this.state.storyToShow.postedBy[0].userName,
                    subheading:  "12h"
                    }
                }
            })
        )
    }
    close = () => {
        console.log("close")
    }
    pauseStory(){
        const reply = document.querySelector(".reply-wrapper");
        if (reply.classList.contains("displayed")){
            reply.classList.remove("displayed")
            this.setState({isStoryPlaying: true})
        }else{
            reply.classList.add("displayed");
            this.setState({isStoryPlaying: false})
        }
    }
    customCollapsedComponent = ({ toggleMore, action }) =>{
        return <div className="story-overlay">
            {
                this.state.isStoryPlaying ?
                <PlayerPause onClick={() => {
                    action('pause');
                    this.pauseStory();
                }} size={40} strokeWidth={2} color="white"/>
                :
                <PlayerPlay onClick={() => {
                    action('play');
                    this.pauseStory();
                }} size={40} strokeWidth={2} color="white"/>
            }
        </div>
    }
    storyCreate = (obj) => {
        
        return obj.stories.map((item)=>{
            return {
                url: item.image.url,
                header: {
                   profileImage: this.state.storyToShow.postedBy[0].avt,
                   heading: this.state.storyToShow.postedBy[0].userName,
                   subheading:  "12h"
                },
                seeMore: ({ close }) => {
                    return <div onClick={close}>Hello, click to close this.</div>;
                },
                seeMoreCollapsed: this.customCollapsedComponent
            }
        })
    }

    viewStory = (items,index) =>{
        let nextId = '';
        if(this.state.startIndex < this.state.storyToShow.stories.length)
        {
            nextId = this.state.storyToShow.stories[this.state.startIndex]._id
        }else{
            nextId = 0;
        }
        console.log("hereeeeee",nextId)
        this.setState({
            mess: {
                ...this.state.mess,
                attachment: nextId,
            }
        },()=>{console.log("hereeeeeeeeeeee",this.state.mess)});
        if(index !== -1){
            viewStory(this.state.storyToShow.stories[index]._id)
        }
    }

    increaseStartIndex = () =>{
        try{
            if(this.state.startIndex < this.state.storyToShow.stories.length-1){
                this.setState({
                    startIndex: this.state.startIndex+1,
                });
            }
        }catch(err){
            console.log(err)
        }
    }

    deleteStory = () =>{
        this.props.dispatch(deleteStory(this.state.mess.attachment)).then(response => {
            // console.log("delete storiesssss",response)
            if(response.payload.success){
                //Update story to show
                //Update start index
                //story will rerender
                const storyToShow = {...response.payload.storyList[0]}
                if(response.payload.storyList[0].stories.length == 0)
                {
                    this.props.history.push('/newfeed')
                }else{
                    if(this.state.startIndex == response.payload.storyList[0].stories.length){
                        this.setState({ 
                            storyToShow: response.payload.storyList[0],
                            startIndex: this.state.startIndex -1
                        });
                    }else{
                        this.setState({ 
                            storyToShow: response.payload.storyList[0],
                        });
                    }
                }
            }
        })
    }

    submitForm = (event) => {
        event.preventDefault();;
        if(this.state.mess.content.trim()){
            let dataToSubmit = this.state.mess;
            console.log(dataToSubmit);
            replyStory(dataToSubmit).then(response=>{
                if(response.messagelist){
                    this.setState({
                        sendSucess: true,
                        message: "success",
                        mess:{
                            ...this.state.mess,
                            content: '',
                        }
                    })
                }else{
                    this.setState({
                        sendSucess: true, 
                        message: "error",  
                    })
                }
            });
        }else{
            console.log("Hờ ớ");
        }   
    }

    render() {
        return (
            this.state.storyToShow ?
            <div className="storyPage">
                <div className="storyPage__header">
                    <div className="header__logo" onClick={()=>{this.props.history.push('/newfeed')}}>
                        <img class="Logo_stunn"src={require('../../asset/logo/logoIcon2x.png')} />
                        <img class="Logo_text" src={require('../../asset/logo/whiteLogo2x.png')} />
                    </div>
                    <div className="close_button">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                <div className="current_story">
                    <div className="story_wrapper">
                            <ArrowLeft onClick={() => {
                                if(this.state.startIndex != 0){ 
                                    this.setState({ 
                                        startIndex: this.state.startIndex-1
                                    },()=>{this.viewStory(this.state.storyToShow, this.state.startIndex)}); 
                                }else{
                                    this.previousStory();
                                }
                            }} size={40} strokeWidth={2} color="white"/>
                            <Stories
                                stories={this.storyCreate(this.state.storyToShow)}
                                defaultInterval={5000}
                                width="26rem"
                                height="100%"
                                isPaused={true}
                                currentIndex={this.state.startIndex}
                                onStoryStart={() => {this.viewStory(this.state.storyToShow, this.state.startIndex)}}
                                onStoryEnd={()=>{this.increaseStartIndex()}}
                                onAllStoriesEnd={() => this.nextStory()}
                            />
                            <ArrowRight onClick={() => {
                                console.log(this.state.startIndex,this.state.storyToShow.stories.length)
                                if(this.state.startIndex != this.state.storyToShow.stories.length-1){
                                    this.setState({ 
                                        startIndex: this.state.startIndex+1
                                    },()=>{this.viewStory(this.state.storyToShow, this.state.startIndex)});
                                }else{
                                    this.nextStory()
                                }
                            }} size={40} strokeWidth={2} color="white"/>
                    </div>
                </div>
                    <div className={this.state.mess.sentBy == this.state.mess.sentTo ? "reply-wrapper space" : "reply-wrapper end"}>
                        <div className={this.state.mess.sentBy == this.state.mess.sentTo ? "main display" : "hiden"}>
                            <div className="user-list">
                                <div className="users-view-story">
                                   <Eye size={30} strokeWidth={2} color="black"/>
                                    {this.state.storyToShow.stories[this.state.startIndex].viewedBy.length != 0 ?
                                        <p>{this.state.storyToShow.stories[this.state.startIndex].viewedBy.length} người đã xem </p>
                                    :<p>Chưa có người xem</p>   
                                    }
                                </div>
                                <ul>
                                    {
                                        this.state.storyToShow.stories[this.state.startIndex].viewedBy.map((item,idx) =>{
                                            return <div className="item" key={idx}>
                                                <div onClick={() => {
                                                    // this.LinkTo("user",item._id)
                                                }} className="user_infor_wrapper">
                                                    <img src={item.avt} />
                                                    <p>{item.userName}</p>
                                                </div>
                                            </div>
                                        })
                                    }
                                </ul>
                            </div>
                            <Trash onClick={this.deleteStory} size={25} strokeWidth={2} color="black"/>
                        </div>
                        <div className={this.state.mess.sentBy == this.state.mess.sentTo ? "hiden" : "display"}>
                            <Reaction/>
                            <form  onSubmit={(event) => this.submitForm(event)}>
                            <div className="chat_box">
                                <div className="chat_area">
                                    <input id="description_textarea" autoComplete="none" type="text" value={this.state.mess.content} placeholder="Nhập tin nhắn...." onChange={(event) => { this.handleChange(event) }}></input>
                                </div>
                                <div className="emoji_icon">
                                    <Sticker onClick={this.emojiClick} size={32} strokeWidth={1} color="black"></Sticker>
                                    {
                                        this.state.emojiToggle ?
                                            <Picker style={{ position: "absolute", right: 0, top: "20%" }} onSelect={this.addEmoji} />
                                        : null
                                    }
                                </div>
                                <div  id="sent_btn" className="send_icon" onClick={(event) => { this.submitForm(event) }}>
                                    <Send size={32} strokeWidth={1} color="white"></Send>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                 {
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    open={this.state.sendSucess}
                    onClose={() => this.setState({ sendSucess: false })}
                    autoHideDuration={1000}
                >
                    <MuiAlert elevation={6} variant="filled" severity={this.state.message} >
                        {
                            this.state.message == "success" ?
                            "Đã gửi tin nhắn"
                            : "Xin thử lại"
                        }
                    </MuiAlert>
                </Snackbar>
                }
            </div>
            : <div>loading</div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        products: state.products
    }
}
export default connect(mapStateToProps)(withRouter(StoryPage));