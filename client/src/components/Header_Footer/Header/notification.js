import React, { Component } from 'react';
import './header.scss'
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { logoutUser, auth, acceptfollow, declinefollow } from '../../../actions/user_action'
import NativeClickListener from '../../ultils/NativeClickListener';
import { getConversation } from '../../../actions/message_action'
import { getNotification, seenNotification, seenAllNotification } from '../../../actions/notification_action'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import faUser from '@fortawesome/fontawesome-free-solid/faUser';
import faCog from '@fortawesome/fontawesome-free-solid/faCog';

import Skeleton from '@material-ui/lab/Skeleton'
import Pusher from 'pusher-js';
import Badge from '@material-ui/core/Badge';
import moment from 'moment'
import { Button, Dialog, LinearProgress, Menu, Chip } from '@material-ui/core';
import { Trash, ridDots, LayoutList, Edit, Settings, LayoutGrid, Tag, Dots, CircleX, Heart, Message2, Bookmark, Pencil, Search, Point, Photo, Sticker, Send, DotsVertical } from 'tabler-icons-react'
import styled from 'styled-components'
import MenuItem from '@material-ui/core/MenuItem';
const StyleButton = styled(Button)`
    color:white;
`;
const StyleClip = styled(Chip)`
border-radius: 4px;
background-color: #e1f5fe;
color: #0095f6;
margin: 4px;
`;


class NotificationDetail extends Component {
    state = {
        anchorEl: null,
    }
    render() {
        return (
                    this.props.data.type != "askfollow" ?
                     this.props.data.disabled != true ?
                        <div className={this.props.data.seenStatus ? "noti_wrapper seen" : "noti_wrapper"} >
                            <div className="user_avt">
                                <img src={this.props.data.sentFrom.role == 0 ? this.props.data.sentFrom.avt : "https://res.cloudinary.com/dlikyyfd1/image/upload/v1610771639/logo2x_lzjmtn.png"}></img>
                            </div>
                            <div className="content" onClick={() => this.props.handleNotiClick(this.props.data._id, this.props.data.type, this.props.data.link)} >
                                <p>
                                    <h6>{this.props.data.sentFrom.role == 0 ? this.props.data.sentFrom.userName : "Stunning "}</h6>
                                    {
                                        this.props.data.type == "follow" ? ' đã theo dõi bạn' :
                                            this.props.data.type == "likepost" ? ' đã thích bài viết của bạn' :
                                                this.props.data.type == 'comment' ? ' đã bình luận về bài viết của bạn' :
                                                    this.props.data.type == 'likecomment' ? ' đã thích bình luận của bạn' :
                                                        this.props.data.type == 'discardReport' ? 'Nội dung bạn báo cáo chưa vi phạm chính sách cộng đồng' :
                                                            this.props.data.type == 'deletePost' ? 'Bài viết của bạn đã bị xoá vì vi phạm chính sách cộng đông' :
                                                                this.props.data.type == 'deleteComment' ? 'Bình luận của bạn đã bị xoá vì vi phạm chính sách cộng đồng ' :
                                                                    this.props.data.type == 'acceptfollow' ? ' đã chấp nhập lời theo dõi của bạn' : ''
                                    }
                                </p>
                                <h6>
                                    <h6>{moment(this.props.data.createdAt).fromNow()} </h6>
                                </h6>

                            </div>
                            <div className="status">
   
                                    <Menu
                                        id="simple-menu"
                                        anchorEl={this.state.anchorEl}

                                        open={Boolean(this.state.anchorEl)}
                                        onClose={() => this.setState({ anchorEl: null })}
                                    >



                                        <MenuItem onClick={()=>this.props.handleDeleteNoti(this.props.data._id)}>Xóa thông báo</MenuItem>
                                        <MenuItem onClick={()=>this.props.handleSeenNoti(this.props.data._id)}>Đánh dấu là đã đọc</MenuItem>

                                    </Menu>

                                    <Button onClick={(event) => this.setState({ anchorEl: event.currentTarget })}>
                                        <DotsVertical strokeWidth={0.5}></DotsVertical>
                                    </Button>
                                    <Button>
                                    <Point visibility={this.props.data.seenStatus ? "hidden" : ""} size={24} strokeWidth={5} color="#7166F9" fill="#7166F9"></Point>
                                    </Button>
                                 
                               
                            </div>
                        </div>:'' :
                        this.props.data.type == "askfollow" ?
                            this.props.data.disabled != true ?

                                <div className={this.props.data.seenStatus ? "noti_wrapper seen" : "noti_wrapper"}>
                                    <div className="user_avt">
                                        <img src={this.props.data.sentFrom.avt}></img>
                                    </div>
                                    <div className="content" onClick={() => this.props.handleNotiClick(this.props.data._id, this.props.data.type, this.props.data.link)}>
                                        <p>
                                            <h6>{this.props.data.sentFrom.userName}</h6>
                                            <p> {this.props.data.userName} Đã yêu cầu theo dõi bạn</p>
                                            <Button onClick={() => this.props.acceptfollow(this.props.data.sentFrom._id)}>Đồng ý</Button>
                                            <Button onClick={() => this.props.declinefollow(this.props.data.sentFrom._id)}>Hủy</Button>
                                        </p>
                                        <h6>
                                            <h6>{moment(this.props.data.createdAt).fromNow()} </h6>
                                        </h6>
                                    </div>
                                    <div className="status">
                                            <Menu
                                                id="simple-menu"
                                                anchorEl={this.state.anchorEl}

                                                open={Boolean(this.state.anchorEl)}
                                                onClose={() => this.setState({ anchorEl: null })}
                                            >
                                                <MenuItem onClick={()=>this.props.handleDeleteNoti(this.props.data._id)}>Xóa thông báo</MenuItem>
                                                <MenuItem onClick={()=>this.props.handleSeenNoti(this.props.data._id)}>Đánh dấu là đã đọc</MenuItem>

                                            </Menu>

                                            <Button onClick={(event) => this.setState({ anchorEl: event.currentTarget })}>
                                                <DotsVertical strokeWidth={0.5}></DotsVertical>
                                            </Button>
                                            <Point visibility={this.props.data.seenStatus ? "hidden" : ""} size={24} strokeWidth={5} color="#7166F9" fill="#7166F9"></Point>
                                        
                                    </div>
                                </div>

                                : null
                            : null
        )
    }

}
export default NotificationDetail