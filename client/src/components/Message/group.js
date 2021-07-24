import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import Skeleton from '@material-ui/lab/Skeleton'
import Portal from '@material-ui/core/Portal';
import { getMessage, getConversation, sendMessage, seenMessage, sendimg } from '../../../src/actions/message_action'
import './Message.scss';
import { update, generateData } from '../ultils/Form/FormActions';
import { Link, withRouter } from 'react-router-dom';
import { Settings, Dots, Heart, Pencil, Search, Photo, Sticker, Send, Ghost, Edit, Circle, CircleCheck, User, Users, Point } from 'tabler-icons-react';
import SearchBar from './SearchBar/index'
import Pusher from 'pusher-js'
import { Button, Dialog, LinearProgress, Checkbox, Avatar } from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';

import moment from 'moment';

class Group extends Component {

    render() {
        return (
            <div className="message_box">

                {
                    this.props.messages ?
                        this.props.messages.grouplist ?
                            this.props.messages.grouplist.map(con => {
                                return (
                                    con.disabledBy.includes(this.props.yourProfile._id)?'':
                                    <div onClick={() => { this.props.seenGroupMess(con._id); console.log('clicked') }}>
                                        {
                                            <Link className="link" to={`/message/inbox/${con._id}`}>

                                                <div className={con.seenBy.includes(this.props.yourProfile._id) ? "row no-gutters message_contain" : "row no-gutters message_contain unseen"}>
                                                    <div className="col-xl-2 col-lg-3 col-md-3 col-sm-3 col-12 avt">
                                                        {
                                                            con.type == 'personal' ?
                                                                con.user.map(users => {
                                                                    return (
                                                                        users._id == this.props.yourProfile._id ? '' : <div className="avatar-circle-group"> <img src={users.avt}></img></div>
                                                                    )

                                                                }) :
                                                                (con.groupimg ? <div className="avatar-circle-group"> <img src={con.groupimg}></img></div> :
                                                                    <div class="avatar-circle-group avatar-circle-group-3">
                                                                        {
                                                                            con.user.slice(0, 1).map(users => {
                                                                                return (
                                                                                    <div>
                                                                                        <div class="avatar avatar-md avatar-1">
                                                                                            <img src={users.avt} />
                                                                                        </div>


                                                                                    </div>


                                                                                )
                                                                            })
                                                                        }
                                                                        {
                                                                            con.user.slice(1, 2).map(users => {
                                                                                return (
                                                                                    <div>


                                                                                        <div class="avatar avatar-md avatar-2">
                                                                                            <img src={users.avt} />
                                                                                        </div>

                                                                                    </div>


                                                                                )
                                                                            })
                                                                        }
                                                                        {
                                                                            con.user.slice(2, 3).map(users => {
                                                                                return (
                                                                                    <div>


                                                                                        <div class="avatar avatar-md avatar-3">
                                                                                            <img src={users.avt} />
                                                                                        </div>
                                                                                    </div>


                                                                                )
                                                                            })
                                                                        }
                                                                    </div>)
                                                        }

                                                    </div>
                                                    <div className="col-xl-10 col-lg-9 col-md-9 col-sm-9 col-12 message">

                                                        {
                                                            con.type == 'personal' ?
                                                                con.user.map(users => {
                                                                    return (
                                                                        users._id == this.props.yourProfile._id ? '' : <div className="titlegroup">

                                                                            <h2>{users.userName}</h2>
                                                                            <Point className="seen_dot" visibility={con.seenBy.includes(this.props.yourProfile._id) ? "hidden" : ""} size={28} strokeWidth={0} fill="#7166F9"></Point>
                                                                        </div>
                                                                    )

                                                                }) :
                                                                con.title ?
                                                                    <div className="titlegroup">

                                                                        <h2>{con.title}</h2>
                                                                        <Point className="seen_dot" visibility={con.seenBy.includes(this.props.yourProfile._id) ? "hidden" : ""} size={28} strokeWidth={0} fill="#7166F9"></Point>
                                                                    </div>
                                                                    :
                                                                    <div className="titlegroup">
                                                                        <h2>
                                                                            {
                                                                                con.user.slice(0, 3).map(users => {
                                                                                    return (

                                                                                        users.userName

                                                                                    )
                                                                                }

                                                                                )

                                                                            },...
                                                                </h2>
                                                                        <Point className="seen_dot" visibility={con.seenBy.includes(this.props.yourProfile._id) ? "hidden" : ""} size={24} strokeWidth={0} fill="#7166F9"></Point>
                                                                    </div>
                                                        }
                                                        {/* <div className="col-xl-3 col-sm-3 col-3  info">
                                                                                    <h6><Point visibility="hidden" size={24} strokeWidth={0} fill="#7166F9"></Point></h6>
                                                                                
                                                                                    
                                                                                   
                                                                                </div> */}

                                                        <h6> {con.lastMess ? (con.lastMess.type == 'event' ? '' : 
                                                        con.lastMess.sentBy._id == this.props.yourProfile._id ? 'Bạn: ' : 
                                                        con.lastMess.sentBy.userName + ': ') : ''}   
                                                        {con.lastMess ? con.lastMess.type == 'img' ? 'Đã gửi một hình ảnh' : 
                                                        con.lastMess.type == 'sticker' ? 'Đã gửi một nhãn dán' :
                                                        con.lastMess.type == 'replyWithReaction' ? 'Đã phản hồi câu chuyện' :  
                                                        con.lastMess.content : ''}</h6>
                                                        <h5>{moment(con.lastMess ? con.lastMess.createdAt : '').fromNow()} </h5>
                                                    </div>
                                                  
                                                 
                                                </div>
                                               
                                            </Link>



                                        }
                                      
                                    </div>
                                    
                                    )
                            }) : ''
                        : ''
                }
                
            </div >

        )
    }
}
export default Group