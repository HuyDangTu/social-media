import React, { Component}  from 'react';
import './StoryPage.scss';
import { connect } from 'react-redux';
import Stories from 'react-insta-stories';
import { getStory, viewStory } from '../../actions/product_actions';
import { withRouter } from 'react-router-dom';
import {  Heart, Photo, Sticker, Send, Ghost } from 'tabler-icons-react'
import { Picker } from 'emoji-mart'
import Reaction from '../Reaction/index';

class StoryPage extends Component {

    state={
        storyId: "",
        currentDisplay: 0,
        storyToShow: null,
        nextStoryId: "",
        currentIndex: 0,
        end: -1,
    }

    loadingStory = {
        url: "https://nguahanoi.vn/wp-content/themes/gv-coporation/images/default.jpg",
        header: ""
    }
   
    pauseStory(){
        const reply = document.querySelector(".reply-wrapper");
        if (reply.classList.contains("displayed")){
             reply.classList.remove("displayed")
        }else{
            reply.classList.add("displayed");
        }
    }

    componentDidMount(){
        //const id = this.props.match.params.id;
        const id = this.props.location.state.id;
        this.setState({storiId:id});   
        this.props.dispatch(getStory(this.props.user.userData._id)).then(()=>{
            const storyToShow = this.props.products.storyList.find(element => element._id === id);
            const index = this.props.products.storyList.indexOf(storyToShow);
            let end = this.endPosition(this.props.products.storyList);
            let nextStoryId = -1;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
            if (index < this.props.products.storyList.length - 1) {
                nextStoryId = this.props.products.storyList[index + 1]._id;
            }
            this.setState({ 
                storyToShow: storyToShow,
                currentDisplay: index,
                nextStoryId: nextStoryId,
                end: end
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
        return stories.findIndex(item => {return !item.viewedBy.includes(this.props.user.userData._id)}) == -1
    }
    nextStory = () => {
        if(this.state.nextStoryId!=-1)
        {
            const storyToShow = this.props.products.storyList.find(element => element._id === this.state.nextStoryId);
            const index = this.props.products.storyList.indexOf(storyToShow);
            if(index == this.state.end){
                this.props.history.push(`/newfeed`);
            }else{
                let nextStoryId = -1;
                if (index < this.props.products.storyList.length - 1) {
                    nextStoryId = this.props.products.storyList[index + 1]._id;
                }else{
                }
                this.setState({
                    storyToShow: storyToShow,
                    nextStoryId: nextStoryId,
                    currentDisplay: index,
                    currentIndex: 0,
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

    storyCreate = (obj) => {
        this.test(obj);
        return obj.stories.map((item)=>{
            return {
                url: item.image,
                header: {
                   profileImage: this.state.storyToShow.postedBy[0].avt,
                   heading: this.state.storyToShow.postedBy[0].userName,
                   subheading:  "12h"
                }
            }
        })
    } 

    viewStory = (items,currentIndex) =>{
        console.log(items);
        this.props.dispatch(viewStory(this.state.storyToShow.stories[currentIndex]._id))
    }

    increaseCurrentIndex = () =>{
        this.setState({currentIndex: this.state.currentIndex+1});
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
                    <div className="story_wrapper" onClick={()=>{this.pauseStory()}}>
                            <Stories
                                stories={this.storyCreate(this.state.storyToShow)}
                                defaultInterval={2000}
                                width="26rem"
                                height="100%"
                                isPaused={true}
                                currentIndex={0}
                                onStoryStart={() => {this.viewStory(this.state.storyToShow, this.state.currentIndex)}}
                                onStoryEnd={()=>{this.increaseCurrentIndex()}}
                                onAllStoriesEnd={() => this.nextStory()}
                            />
                    </div>
                </div>
                <div className="reply-wrapper">
                        <Reaction/>
                        <form onSubmit={(event) => this.submitForm(event)}>
                            <div className="chat_box">
                            <div className="chat_area">
                                <input id="description_textarea" autoComplete="none" type="text" value={this.state.content} placeholder="Nhập tin nhắn...." onChange={(event) => { this.handleChange(event) }}></input>
                                {/* <div className="action_icon" onClick={this.sendHeartIcon}>
                                    <Heart size={32} strokeWidth={1} color="black"></Heart>
                                </div>
                                <div className="action_icon" onClick={this.GifIconClick}>
                                    <Ghost size={32} strokeWidth={1} color="black"> </Ghost>
                                </div> */}
                            </div>
                            {/* <div className="img_upload">
                                <label className="custom-file-upload">
                                    <input type="file" onChange={this.onFileChange} />
                                    <Photo size={32} strokeWidth={1} color="black"></Photo>

                                </label>
                            </div> */}
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