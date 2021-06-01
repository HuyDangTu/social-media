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
import Userinfo from './userinfo'
const StyleButton = styled(Button)`
    color:white;
`;
const StyleClip = styled(Chip)`
border-radius: 4px;
background-color: #e1f5fe;
color: #0095f6;
margin: 4px;
`;

class EditMess extends Component {
    constructor(props) {
        super(props);
        this.title = "";
        this.state = {
            anchorEl: null,
            name: '',
            title: '',
            editname: false,
            addnew: false,
            newmember: [],
            newmemberid: []
        }
    }
    handleChange = (event) => {
        this.setState({ name: event.target.value });
    }
    setTitle = () => {

    }
    editTitle = () => {

    }
    removelist = (id, name) => {
        const list = this.state.newmember;
        list.splice(this.state.newmember.indexOf(name), 1);
        this.setState({ newmember: list });
        const listid = this.state.newmemberid;
        listid.splice(this.state.newmemberid.indexOf(id), 1);
        this.setState({ newmemberid: listid });
    };
    addList = (id, name) => {
        const list = this.state.newmember;
        list.push(name);
        this.setState({ newmember: list });
        const listid = this.state.newmemberid;
        listid.push(id);
        this.setState({ newmemberid: listid });
    }
    openMenu = (event) => {
        this.setState({ anchorEl: event.currentTarget })
    }
    closeMenu = () => {
        this.setState({ anchorEl: null })
    }
    componentDidMount = () => {

        this.title = "";
        if (this.props.conversation.title) {
            this.title = this.props.conversation.title;
        }
        else {
            this.props.conversation.user.map(mess =>
                this.title = this.title + mess.userName + ", ")
        }
        this.setState({ name: this.title })
    }

    render() {
        return (
            <div className="edit_popup">
                <div className="edit_name">
                    <div className="name">
                        {
                            this.props.conversation.type == "personal" ? <input type="text" value={this.props.conversation.user.map(users => { return (users._id != this.props.yourProfile._id ? users.userName : '') })}></input> : <input type="text" value={this.state.name} onChange={(event) => { this.handleChange(event) }}></input>
                        }

                        {/* <input disabled={true} hidden={this.state.editname} onClick={()=>this.setState({editname:true})} value={this.title}></input> */}
                    </div>
                    {
                        this.title.trim() == this.state.name.trim() ?
                            <h6></h6> :
                            <h6 onClick={async () => { await this.props.editTitle(this.props.conversation._id, this.state.name); await (this.props.createGroupEvent(this.props.yourProfile.userName + " đã đổi tên cuộc trò chuyện thành " + this.state.name)) }}>Lưu</h6>
                    }

                    {/* <Pencil strokeWidth={0.5} onClick={() => this.setState({ name: this.title, editname: !(this.state.editname) })}></Pencil> */}
                </div>
                {
                    this.props.conversation.type == "personal" ? ''
                        :
                        <div>
                            <hr></hr>
                            <label className="custom-file-upload">
                                <input type="file" onChange={(event) => this.props.onGroupImgChange(event)} />
                                <h6>Đổi ảnh nhóm</h6>
                            </label>

                        </div>
                }
                <hr></hr>
                <div className="add_member">
                    <h6>Thành viên</h6>
                    {
                        this.props.conversation.type == "personal" ? '' : <h6 id="addbtn" onClick={() => this.setState({ addnew: true })}>+ Thêm thành viên</h6>
                    }

                </div>

                {
                    this.props.conversation ? this.props.conversation.user ? this.props.conversation.user.map(mess => {
                        return (
                            mess ?


                                <Userinfo history={this.props.history} follow={this.props.follow} unfollow={this.props.unfollow} outGroup={this.props.outGroup} removeMember={this.props.removeMember} conversation={this.props.conversation} mess={mess} yourProfile={this.props.yourProfile} openMenu={this.openMenu} anchorEl={this.state.anchorEl} closeMenu={this.closeMenu}></Userinfo>


                                : ''
                        )
                    }
                    ) : '' : ''
                }

                {
                    this.props.conversation.type == "personal" ? '' :
                        <div>
                            <hr></hr>
                            <h6 onClick={() => this.props.outGroup(this.props.conversation._id, this.props.yourProfile._id)}>Thoát nhóm</h6>
                        </div>
                }

                <Dialog open={this.state.addnew} onClose={() => this.setState({ addnew: false })}>
                    <div className="newmess_contain">
                        <div className="newmess_header">
                            {
                                this.props.conversation.type == "personal" ? '' : <h5>Thêm thành viên</h5>
                            }
                            <h6 className={this.state.newmember.length > 0 ? "active" : "disable"} onClick={() => this.props.addMember(this.props.conversation._id, this.state.newmember, this.state.newmemberid)}>Thêm</h6>
                        </div>
                        <hr></hr>
                        <div className="search">

                            {
                                this.state.newmember.map(sendlist => {
                                    return (
                                        <StyleClip label={sendlist} color="primary" onDelete={() => { this.removelist(sendlist) }}></StyleClip>

                                    )
                                })
                            }
                            <SearchBar sendinguserlistid={this.state.newmemberid} removelist={this.removelist} addList={this.addList} />
                        </div>
                        <hr></hr>
                        <div className="suggest">
                            <h6>Gợi ý</h6>

                        </div>
                    </div>
                </Dialog>
            </div>


        )
    }
}

export default EditMess;