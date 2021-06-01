import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import Skeleton from '@material-ui/lab/Skeleton'
import { getMessage, getConversation, sendMessage, seenMessage, sendimg, editTitle, addMember, removeMember } from '../../../src/actions/message_action'
import './Message.scss';
import { update, generateData } from '../ultils/Form/FormActions';
import { Link, withRouter } from 'react-router-dom';
import { Trash, ridDots, LayoutList, Edit, Settings, LayoutGrid, Tag, Dots, CircleX, Heart, Message2, Bookmark, Pencil, Search, Point, Photo, Sticker, Send, DotsVertical } from 'tabler-icons-react'
import Pusher from 'pusher-js'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Button, Dialog, LinearProgress, Menu, Chip } from '@material-ui/core';
import styled from 'styled-components'
import MenuItem from '@material-ui/core/MenuItem';
import SearchBar from './SearchBar/index';
const StyleButton = styled(Button)`
    color:white;
`;
const StyleClip = styled(Chip)`
border-radius: 4px;
background-color: #e1f5fe;
color: #0095f6;
margin: 4px;
`;

class UserInfo extends Component {
    state={
        anchorEl:null,
    }
    render() {
        return (
            <div className="user_contain">       
            <div className="uinfo">
                <img src={this.props.mess.avt}></img>
                <h2 onClick={()=>this.props.history.push(`/user/${this.props.mess._id}`)}>{this.props.mess.userName}</h2>
            </div>
           
           <div className="action">    
                                 
                                  <Menu
                                      id="simple-menu"
                                      anchorEl={this.state.anchorEl}
                              
                                      open={Boolean(this.state.anchorEl)}
                                      onClose={() => this.setState({anchorEl: null})}
                                  >
                                      
                                     
                                      
                                      <MenuItem><h6 onClick={()=>this.props.history.push(`/user/${this.props.mess._id}`)}>{this.props.mess.userName}</h6></MenuItem>
                                      <hr></hr>
                                      {
                                    this.props.conversation.type=="personal"?'':
                                      this.props.mess._id==this.props.yourProfile._id?
                                      <MenuItem onClick={()=>this.props.outGroup(this.props.conversation._id,this.props.mess._id)}>Thoát Nhóm</MenuItem>:
                                      <MenuItem onClick={()=>this.props.removeMember(this.props.conversation._id,this.props.mess._id)}>Xóa Khỏi Nhóm</MenuItem>
                                      }
                                      <MenuItem>Xem trang cá nhân</MenuItem>
                                     
                                  </Menu>
                                 
                              <Button onClick={(event) => this.setState({anchorEl: event.currentTarget})}>
                                      <DotsVertical strokeWidth={0.5}></DotsVertical>
                                  </Button>
                                  {
                                      this.props.yourProfile ? (this.props.yourProfile._id == this.props.mess._id ? <Button className="minibtn" onClick={()=>this.props.history.push(`/user/${this.props.mess._id}`)}> Trang cá nhân</Button>
                                          :
                                          this.props.yourProfile ? this.props.yourProfile.followings.includes(this.props.mess._id) ?
                                              <Button className="minibtn" onClick={()=>this.props.unfollow(this.props.mess._id)}> Đang theo dõi</Button>
                                              :
                                              <Button className="minibtn" onClick={()=>this.props.follow(this.props.mess._id)}>Theo dõi</Button>
                                              : null)
                                          : null
                              }
                              </div>
        </div>
        )
    }
}

export default UserInfo;