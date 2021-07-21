import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import Skeleton from '@material-ui/lab/Skeleton'
import {findProfile} from '../../../src/actions/user_action'
import { getMessage, getConversation, sendMessage, seenMessage, sendimg} from '../../../src/actions/message_action'
import './Message.scss';
import moment from 'moment';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Button, LinearProgress, Accordion} from '@material-ui/core';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import styled from 'styled-components'
const StyleButton = styled(Button)`
    color:white;
`;
const AccordionStyle = styled(Accordion)`
all:unset;
`;
class GroupMess extends Component {
    state ={
        show: false,
    }
    render() {

        return (
            this.props.mess?this.props.mess.type == 'event'?<h6 className="chat_event">{this.props.mess.content}</h6>:
            this.props.mess.sentBy?  this.props.mess.sentBy._id == this.props.yourProfile._id ?
            <div className="row no-gutters sent">
               
                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6 ">
                </div>
                <ClickAwayListener onClickAway={this.handleClickAway}>
                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6  sent_mess">
            
                    {
                        this.props.mess.type == 'text' ?
                            <div className="message_content">
                                {
                                this.state.show?
                                <h6>{moment(this.props.mess.updatedAt).format("HH:MM A")}</h6>:
                                ''}
                            <p  onClick={()=>this.setState({show:!this.state.show})}>
                                {this.props.mess.content}  
                            </p>
                        
                            </div>
                            :
                            this.props.mess.type == 'img' ?
                                <img onClick={this.handleMessClick} src={this.props.mess.content}></img> :
                            this.props.mess.type == 'sticker' ?
                                <img onClick={this.handleMessClick} className="sticker_mess" src={this.props.mess.content}></img> :
                            this.props.mess.type == 'replyStory' ?
                                <div className="message_content">
                                    <p onClick={()=>{}}>
                                        Đã trả lời story: {this.props.mess.content}
                                    </p>
                                </div>
                            :""

                    }
                    
                  
                </div>
                </ClickAwayListener>

            </div> :
            <div className="row no-gutters receive">
                 {this.props.mess.type == 'event'?<h6 className="chat_event">{this.props.mess.content}</h6>:''}
                 {
                        this.state.show?
                        <h6>{moment(this.props.mess.updatedAt).format("HH:MM A")}</h6>:
                        ''}
                <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 avt">
                     <img src={this.props.mess.sentBy.avt}></img>
                </div>
                <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-5 receive_mess">

                    {
                        this.props.mess.type == 'text' ?
                       
                    <p  onClick={()=>this.setState({show:!this.state.show})}>
                        {this.props.mess.content}  
                    </p>
            
                            :
                            this.props.mess.type == 'img' ?
                                <img src={this.props.mess.content}></img> :
                                this.props.mess.type == 'sticker' ?
                                    <img className="sticker_mess" src={this.props.mess.content}></img> : ''
                        
                    }
                    
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6">
                </div>
            </div> :"": "")
    }
}

export default GroupMess;