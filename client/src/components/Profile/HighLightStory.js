import React, { Component } from 'react';
import './Story.scss';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

class HighLightStory extends Component {
  
    isViewed(item){
        let res = true;
        console.log(item);
        item.stories.map(story=>{
            if(!story.viewedBy.includes(this.props.user.userData._id)){
                console.log("false")
                res =  false;
            }
        })
        return res;
    }
    render() {
        console.log(this.props.list);
        return (
            <div className="highlightStory">
                <div className="stories">
                    <ul>
                        {
                            this.props.list ?
                                this.props.list.map((item,index) =>{
                                    return (
                                        <li 
                                            onClick={() => {this.props.setIndex(index); this.props.openDialog()}} 
                                            className="has-story">
                                            <div className="story_wrapper">
                                                <img src={item.storyList[0].image.url}/>
                                            </div>
                                            <span className="user">{item.name}</span>
                                        </li>
                                    )
                                })
                            : ""                            
                        }
                        <li className="has-story" onClick={this.props.open}>
                            <div className="story_add_button">
                                <div className="avatar">
                                    <div className="add_icon">
                                        +
                                    </div>
                                </div>
                            </div>
                            <span className="user">New</span>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(withRouter(HighLightStory));