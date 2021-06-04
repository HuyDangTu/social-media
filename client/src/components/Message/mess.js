import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import Skeleton from '@material-ui/lab/Skeleton'
import { getMessage, getConversation, sendMessage, seenMessage, sendimg} from '../../../src/actions/message_action'
import './Message.scss';
import { update, generateData } from '../ultils/Form/FormActions';
import { Link, withRouter } from 'react-router-dom';
import { Trash, ridDots, LayoutList, Edit, Settings, LayoutGrid, Tag, Dots, CircleX, Heart, Message2, Bookmark, Pencil, Search, Point, Photo, Sticker, Send } from 'tabler-icons-react'
import Pusher from 'pusher-js'
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Accordion, Button, LinearProgress } from '@material-ui/core';
import styled from 'styled-components'
const StyleButton = styled(Button)`
    color:white;
`;

class Mess extends Component {
    state ={
        show: true,
    }
    render() {
        return (this.props.mess ? this.props.mess.sentBy == this.props.yourProfile._id ?
            <div className="row no-gutters sent">
               
                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6 ">
                </div>
                <ClickAwayListener onClickAway={this.handleClickAway}>
                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6  sent_mess">
                    {
                            this.props.mess.type == 'text' ?

                            <p onClick={()=>this.setState({show:true})}>

                                {this.props.mess.content}
                            </p>
                            :
                            this.props.mess.type == 'img' ?
                                <img onClick={this.handleMessClick} src={this.props.mess.content}></img> :
                            this.props.mess.type == 'sticker' ?
                                <img onClick={this.handleMessClick} className="sticker_mess" src={this.props.mess.content}></img> :
                            this.props.mess.type == 'replyStory' ?
                                <p onClick={()=>this.setState({show:true})}>
                                    Đã trả lời tin của bạn: {this.props.mess.content}
                                </p>
                            :""
                    }
                    {
                        this.state.show?
                        <h6>{this.props.mess.content}</h6>:
                        ''
                    }
                  
                </div>
                </ClickAwayListener>

            </div> :
            <div className="row no-gutters receive">

                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6 receive_mess">

                    {
                        this.props.mess.type == 'text' ?

                            <p>
                              
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
            </div> : "")
    }
}

export default Mess;