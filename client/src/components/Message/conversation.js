import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import Skeleton from '@material-ui/lab/Skeleton'
import Portal from '@material-ui/core/Portal';
import { getMessage, getConversation, sendMessage, seenMessage, sendimg } from '../../../src/actions/message_action'
import './Message.scss';
import { update, generateData } from '../ultils/Form/FormActions';
import { Link, withRouter } from 'react-router-dom';
import { Settings, Dots, Heart, Pencil, Search, Photo, Sticker, Send, Ghost, Edit, Circle, CircleCheck, User, Users } from 'tabler-icons-react';
import SearchBar from './SearchBar/index'
import Pusher from 'pusher-js'
import { Button, Dialog, LinearProgress,Checkbox,Chip } from '@material-ui/core';
import Mess from './mess';
import ReactDOM from 'react-dom'
import { Picker } from 'emoji-mart'
import Picker2 from 'react-giphy-component'
import styled from 'styled-components'
import moment from 'moment';

class Conversation extends Component {
    render() {
        return(
            <div className="message_box">
                                    {this.props.messages ? console.log(this.props.messages) : ""}
                                    {
                                        this.props.messages ?
                                            this.props.messages.conlist ?
                                                this.props.messages.conlist.map(con => {
                                                    return (
                                                        <div>
                                                            {

                                                                //Nếu user đã xem
                                                                con.seenBy.includes(this.props.yourProfile._id) ?
                                                                    con.user1._id != this.props.yourProfile._id ?
                                                                        <Link className="link" to={`/message/inbox/${con.user1._id}`}>
                                                                            <div className="row no-gutters message_contain">
                                                                                <div className="col-xl-2 col-lg-3 col-md-3 col-sm-3 col-12 avt">
                                                                                    <img src={con.user1.avt}></img>
                                                                                </div>
                                                                                <div className="col-xl-10 col-lg-9 col-md-9 col-sm-9 col-12 message">
                                                                                    <h2>{con.user1.userName}</h2>
                                                                                    <h6>{con.lastMess ? con.lastMess.sentBy == this.props.yourProfile._id ? 'Bạn: ' : '' : ''}   {con.lastMess ? con.lastMess.type == 'img' ? 'Đã gửi một hình ảnh' : con.lastMess.type == 'sticker' ? 'Đã gửi một nhãn dán' : con.lastMess.content : ''}</h6>
                                                                                </div>
                                                                               
                                                                            </div>
                                                                        </Link>
                                                                        :
                                                                        <Link className="link" to={`/message/inbox/${con.user2._id}`}>
                                                                            <div className="row no-gutters message_contain">
                                                                                <div className="col-xl-2 col-lg-3 col-md-3 col-sm-3 col-12 avt">

                                                                                    <img src={con.user2.avt}></img>
                                                                                </div>
                                                                                <div className="col-xl-10 col-lg-9 col-md-9 col-sm-9 col-12  message">
                                                                                    <h2 >{con.user2.userName}</h2>
                                                                                    <h6>{con.lastMess ? con.lastMess.sentBy == this.props.yourProfile._id ? 'Bạn: ' : '' : ''}
                                                                                        {con.lastMess ? con.lastMess.type == 'img' ? 'Đã gửi một hình ảnh' : con.lastMess.type == 'sticker' ? 'Đã gửi một nhãn dán' : con.lastMess.content : ''}</h6>

                                                                                </div>
                                                                                {/* <div className="col-xl-3 col-sm-3 col-3  info">
                                                                                    <h6><Point visibility="hidden" size={24} strokeWidth={0} fill="#7166F9"></Point></h6>
                                                                                
                                                                                    <h6>{moment(con.lastMess ? con.lastMess.createdAt:'').fromNow(true)} </h6>
                                                                                   
                                                                                </div> */}
                                                                            </div>
                                                                        </Link>
                                                                    :
                                                                    //Nếu user chưa xem
                                                                    con.user1._id != this.props.yourProfile._id ?
                                                                        <Link className="link" to={`/message/inbox/${con.user1._id}`} onClick={()=>this.props.seenMessage(con.user1._id)}>
                                                                            <div className="row no-gutters message_contain unseen">
                                                                                <div className="col-xl-2 col-lg-2 col-md-3 col-sm-3 col-12 avt">
                                                                                    <img src={con.user1.avt}></img>
                                                                                </div>
                                                                                <div className="col-xl-10 col-lg-9 col-md-9 col-sm-9 col-12  message">
                                                                                    <h2>{con.user1.userName}</h2>
                                                                                    <h6>{con.lastMess ? con.lastMess.sentBy == this.props.yourProfile._id ? 'Bạn: ' : '' : ''}  {con.lastMess ? con.lastMess.type == 'img' ? 'Đã gửi một hình ảnh' : con.lastMess.type == 'sticker' ? 'Đã gửi một nhãn dán' : con.lastMess.content : ''}</h6>
                                                                                </div>
                                                                                {/* <div className="col-xl-3 col-sm-3 col-3  info">
                                                                                    <h6><Point size={24} strokeWidth={0} fill="#7166F9"></Point></h6>
                                                                                   
                                                                                    <h6>{moment(con.lastMess ? con.lastMess.createdAt:'').fromNow(true)}</h6>
                                                                                </div> */}
                                                                            </div>
                                                                        </Link>
                                                                        :
                                                                        <Link className="link" to={`/message/inbox/${con.user2._id}`} onClick={() => this.props.seenMessage(con.user2._id)}>
                                                                            <div className="row no-gutters message_contain unseen">
                                                                                <div className="col-xl-2 col-lg-3 col-md-3 col-sm-3 col-12 avt">
                                                                                    <img src={con.user2.avt}></img>
                                                                                </div>
                                                                                <div className="col-xl-10 col-lg-9 col-md-9 col-sm-9 col-12  message">
                                                                                    <h2 >{con.user2.userName}</h2>
                                                                                    <h6>{con.lastMess ? con.lastMess.sentBy == this.props.yourProfile._id ? 'Bạn: ' : '' : ''}  {con.lastMess ? con.lastMess.type == 'img' ? 'Đã gửi một hình ảnh' : con.lastMess.type == 'sticker' ? 'Đã gửi một nhãn dán' : con.lastMess.content : ''}</h6>
                                                                                </div>
                                                                                {/* <div className="col-xl-3 col-sm-3 col-3  info">
                                                                                    <h6><Point size={24} strokeWidth={0} fill="#7166F9"></Point></h6>
                                                                                 
                                                                                    <h6>{moment(con.lastMess ? con.lastMess.createdAt:'').fromNow(true)}</h6>
                                                                                </div> */}
                                                                            </div>
                                                                        </Link>
                                                            }
                                                        </div>
                                                    )
                                                }
                                                ) : ''
                                            : ''
                                    }


                                </div>)
}
}
export default Conversation