import React, { Component } from 'react';
import './Story.scss';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

class Story extends Component {
  
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
            <div className="story">
                <div className="stories">
                    <ul>
                        <li className="has-story">
                            <div className="story_add_button">
                                <div className="avatar">
                                    <div className="add_icon">
                                        +
                                    </div>
                                </div>
                            </div>
                            <span className="user">Add new</span>
                        </li>
                        {
                            this.props.list ?
                                this.props.list.map((item,index) =>{
                                    return (
                                        <li onClick={() => this.props.history.push(
                                            {
                                                pathname: '/story',
                                                state: {
                                                    id: item._id,
                                                }
                                            })} 
                                            //`/story/${item._id}`)} 
                                            className="has-story">
                                            <div className={ this.isViewed(item) ? "story_wrapper_actived":"story_wrapper"}>
                                                <img src={item.postedBy[0].avt}/>
                                            </div>
                                            <span className="user">{item.postedBy[0].userName}</span>
                                        </li>
                                    )
                                })
                            : ""                            
                        }
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

export default connect(mapStateToProps)(withRouter(Story));