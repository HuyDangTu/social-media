import React, { Component } from 'react';
import './Story.scss';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

class Story extends Component {

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
                                        <li onClick={() => this.props.history.push(`/story/${item._id}`)} className="has-story">
                                            <div className="story_wrapper">
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