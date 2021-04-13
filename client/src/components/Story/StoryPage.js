import React, { Component}  from 'react';
import './StoryPage.scss';
import { connect } from 'react-redux';
import Stories from 'react-insta-stories';
import { getStory, viewStory } from '../../actions/product_actions';
import { replyStory } from '../../../src/actions/message_action'
import { withRouter } from 'react-router-dom';
import { Sticker, Send, PlayerPlay, PlayerPause } from 'tabler-icons-react'
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
            let end = this.endPosition(this.props.products.storyList);
            let startIndex = this.startIndex(storyToShow.stories)
            console.log(startIndex);
            let nextStoryId = -1;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
            if (index < this.props.products.storyList.length - 1) {
                nextStoryId = this.props.products.storyList[index + 1]._id;
            }
            this.setState({ 
                storyToShow: storyToShow,
                currentDisplay: index,
                nextStoryId: nextStoryId,
                startIndex: startIndex,
                end: end,
                mess: {
                    ...this.state.mess,
                    sentTo: this.props.products.storyList[index]._id,
                    sentBy: this.props.user.userData._id,
                    attachment: this.props.products.storyList[index].stories[this.state.startIndex]._id,
                }
            });
            console.log(this.state.currentDisplay, this.state.storyToShow, this.state.nextStoryId);
        })
    }
    endPosition = (list) => {
        return list.findIndex(item => {
            return item.stories.findIndex(item => {return !item.viewedBy.includes(this.props.user.userData._id)}) == -1
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
                }else{
                }
                this.setState({
                    storyToShow: storyToShow,
                    nextStoryId: nextStoryId,
                    currentDisplay: index,
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
        return <div>
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
        let nextId = ''
        if(this.state.startIndex < this.state.storyToShow.stories.length)
        {
            nextId = this.state.storyToShow.stories[this.state.startIndex]._id
        }else{
            nextId = 0;
        }
        // console.log("hereeeeee",this.state.mess)
        // console.log("hgsdhsdgdfdfjsdfh",this.state.storyToShow.stories[this.state.startIndex]._id);
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
        this.setState({
            startIndex: this.state.startIndex+1,
        });
    }

    submitForm = (event) => {
        event.preventDefault();
        console.log("sjdgfdshgfsjdfkjsdhjfgdfh",this.state.mess.content);
        if(this.state.mess.content.trim()){
            console.log("sjdgfdshgfsjdfkjsdhjfgdfh");
            let dataToSubmit = this.state.mess;
            replyStory(dataToSubmit).then(response=>{
                console.log(response);
                //document.getElementById('messageBox').reset();
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
            console.log("sjdgfdshgfsjdfkjsdhjfgdfh");
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
                            <Stories
                                stories={this.storyCreate(this.state.storyToShow)}
                                defaultInterval={2000}
                                width="26rem"
                                height="100%"
                                isPaused={true}
                                currentIndex={this.state.startIndex}
                                onStoryStart={() => {this.viewStory(this.state.storyToShow, this.state.startIndex)}}
                                onStoryEnd={()=>{this.increaseStartIndex()}}
                                onAllStoriesEnd={() => this.nextStory()}
                            />
                    </div>
                </div>
                    <div className="reply-wrapper">
                        <div className={this.state.mess.sentBy == this.state.mess.sentTo ? "display" : "hiden"}>
                            <button class="btn">Delete</button>
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