import React, { Component } from 'react';
import './StoryPage.scss';
import { connect } from 'react-redux';
import Stories from 'react-insta-stories';
import { getStory } from '../../actions/product_actions';
import { withRouter } from 'react-router-dom';

class StoryPage extends Component {

    state={
        storyId: "",
        currentDisplay: 0,
        storyToShow: null,
        nextStoryId: "",
    }

    loadingStory = {
        url: "https://nguahanoi.vn/wp-content/themes/gv-coporation/images/default.jpg",
        header: ""
    }

    componentDidMount(){
        const id = this.props.match.params.id;
        this.setState({storiId:id});
        this.props.dispatch(getStory()).then(()=>{
            const storyToShow = this.props.products.storyList.find(element => element._id === id);
            const index = this.props.products.storyList.indexOf(storyToShow);
            let nextStoryId = -1;
            if (index < this.props.products.storyList.length - 1) {
                nextStoryId = this.props.products.storyList[index + 1]._id;
            }
            this.setState({ 
                storyToShow: storyToShow,
                currentDisplay: index,
                nextStoryId: nextStoryId
            });
            console.log(this.state.currentDisplay, this.state.storyToShow, this.state.nextStoryId);
        })
    }

     nextStory = () =>{
       if(this.state.nextStoryId!=-1)
       {
           console.log("yes");
            const storyToShow = this.props.products.storyList.find(element => element._id === this.state.nextStoryId);
            console.log("storyToShow", storyToShow);
            const index = this.props.products.storyList.indexOf(storyToShow);
            console.log("index", index);
            let nextStoryId = -1;
            if (index < this.props.products.storyList.length - 1) {
                nextStoryId = this.props.products.storyList[index + 1]._id;
                console.log("nextStoryId", nextStoryId);
            }
            this.setState({
                storyToShow: storyToShow,
                nextStoryId: nextStoryId,
                currentDisplay: index,
            });
            // ()=> console.log("nextstory",this.state.currentDisplay, this.state.storyToShow, this.state.nextStoryId)
        }else{
             this.props.history.push(`/newfeed`);
             console.log("no");
        }
    }
 
    storyCreate = (obj) => {
        return obj.stories.map((item)=>{
            return {
                url: item.image,
                header: item.dateDifference
            }
        })
    } 
   
    render() {

        return (
            this.state.storyToShow ?
            <div className="storyPage">
                <div className="current_story">
                    <div className="info">
                        <div className="user_avt">
                            <img src={this.state.storyToShow.postedBy[0].avt} />
                        </div>
                        <div className="user_info">
                            <span className="user_name">{this.state.storyToShow.postedBy[0].userName}</span>
                        </div>
                    </div>
                    <div className="story_wrapper">
                        {
                            <Stories
                                stories={this.storyCreate(this.state.storyToShow)}
                                defaultInterval={3000}
                                width={350}
                                height={560}
                                isPaused={false}
                                currentIndex={0}
                                onAllStoriesEnd={() => this.nextStory()}
                            />
                        }
                    </div>
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