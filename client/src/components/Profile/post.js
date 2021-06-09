import React, { Component } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import { findProfile, follow, unfollow, findTagged, findPosted, findSaved ,auth, blockUser } from '../../../src/actions/user_action'
import {findPersonal} from '../../../src/actions/message_action'
import {getHighLightStory,getAllStories,createHighLightStory} from '../../actions/user_action';
import './profile.scss';
import { GridDots, Tag, Dots, CircleX, Heart, Message2,Bookmark } from 'tabler-icons-react'
import HighLightStory from './HighLightStory';
import StoryDisplay from './StoryDisplay';
import { Button, withTheme, Snackbar, SnackbarMessage, Dialog } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton'
import MuiAlert from '@material-ui/lab/Alert';
import { Link, withRouter } from 'react-router-dom';
import FormField from '../ultils/Form/FormField';
import { populateOptionFields, update, ifFormValid, generateData, resetFields } from '../ultils/Form/FormActions';
import Slide from '@material-ui/core/Slide';
import Report from '../Report/Report';
import Post from './post';
import { getPolicy } from '../../actions/policy_actions';
import moment from 'moment';

class PostRow extends Component {
   render(
   )
   {
    return(
        <div className="row body">
        {
            this.props.typelist ? this.props.typelist.map(posts => {
                return posts.hidden ? null :
                    (
                        <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 image_contain" onClick={()=>this.props.history.push(`/postDetail/${posts._id}`)}>
                        <div className="img_overlay">
                            <div className="overlay_info">
                                <div className="hearts"> <Heart size={24} strokeWidth={1} color="white" fill="white"></Heart><h2>{posts.likes.length}</h2> </div>
                                <div className="comments">  <Message2 size={24} strokeWidth={1} color="white" fill="white"></Message2><h2>{posts.comments.length} </h2></div>
                            </div>
                        </div>
                        <img src={posts.images[0].url}></img>
                    </div>
                )
            }) : <Skeleton variant="rect" width={1043} height={315} />
        }
    </div>
    )
    };
}
export default PostRow