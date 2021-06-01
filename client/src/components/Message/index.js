import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import Skeleton from '@material-ui/lab/Skeleton'
import Portal from '@material-ui/core/Portal';
import { getMessage, getConversation, sendMessage, seenMessage, sendimg, getGroup, getGroupMessage, sendGroupMessage, createGroup, editTitle, addMember, removeMember, changegroupimg, uploadgroupimg, seenGroupMess } from '../../../src/actions/message_action'
import { follow, unfollow,auth } from '../../../src/actions/user_action'
import GroupMess from './groupmess';
import './Message.scss';
import { update, generateData } from '../ultils/Form/FormActions';
import { Link, withRouter } from 'react-router-dom';
import { Settings, Dots, Heart, Pencil, Search, Photo, Sticker, Send, Ghost, Edit, Circle, CircleCheck, User, Users } from 'tabler-icons-react';
import SearchBar from './SearchBar/index'
import Pusher from 'pusher-js'
import { Button, Dialog, LinearProgress, Checkbox, Chip, Avatar, ClickAwayListener } from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import Mess from './mess';
import EditMess from './editchat'
import ReactDOM from 'react-dom'
import { Picker } from 'emoji-mart'
import Picker2 from 'react-giphy-component'
import styled from 'styled-components'
import moment from 'moment';
import Conversation from './conversation';
import Group from './group';

const GifPicker = styled(Picker2)`
`;
const StyleLink = styled(Link)`
color:black;
`;

const StyleClip = styled(Chip)`
border-radius: 4px;
background-color: #e1f5fe;
color: #0095f6;
margin: 4px;
`;

class Message extends Component {
    state = {
        emojiToggle: false,
        gifToggle: false,
        heart: 'http://res.cloudinary.com/dlikyyfd1/image/upload/v1610161677/1610161676299.png',
        userName: null,
        sending: false,
        _id: null,
        avt: null,
        content: '',
        link: '',
        mess: {
            sentTo: '',
            sentBy: '',
            content: '',
            type: '',
        },
        newmess: false,
        sendinguserlist: [],
        sendinguserlistid: [],
        view: 'ls',
        editmess: false,
    }

    componentDidMount() {

        this.props.dispatch(getGroup())
        /// Bind với pusher để làm realtime
        const pusher = new Pusher('c0e96b0fff8d0edac17d', {
            cluster: 'mt1'
        });
        const channel = pusher.subscribe('messages');
        channel.bind('newMessage', data => {
            if (data.change.fullDocument.sentTo == this.props.user.userData._id || data.change.fullDocument.sentBy == this.props.user.userData._id) {
                this.props.dispatch(getConversation())
                this.setState({ sending: false })
            }
        });
        const groupchan = pusher.subscribe('groups');
        groupchan.bind('newGroupmess', data => {
            if (data.change.documentKey._id == this.props.match.params.id) {
                this.props.dispatch(getGroupMessage(this.props.match.params.id))
                this.setState({ sending: false })
            }
            if (data.change.operationType == "insert") {
                if (data.change.fullDocument.user.includes(this.props.user.userData._id)) {
                    this.props.dispatch(getGroup())
                }
            }
            this.props.messages.grouplist.map(conver => {
                if (conver._id == data.change.documentKey._id) {
                    this.props.dispatch(getGroup())
                }
            })
            if(data.change.operationType=="update"){
                if(data.change.updateDescription?data.change.updateDescription.updatedFields?data.change.updateDescription.updatedFields.user?data.change.updateDescription.updatedFields.user.includes(this.props.user.userData._id):'':'':''){
                    this.props.dispatch(getGroup())
                }
            }
        });
        const conver = pusher.subscribe('conversations');
        conver.bind('changeConver', data => {
            if (data.change.documentKey._id == this.props.messages.messlist._id) {
                this.props.dispatch(getMessage(this.props.match.params.id))
            }
        })
        this.scrollToBottom();
        this.props.dispatch(getGroupMessage(this.props.match.params.id)).then(data => {
            this.setState({ userName: this.props.messages.groupmesslist.user, _id: this.props.messages.groupmesslist._id })
            this.state.mess.sentTo = this.state._id;
            this.state.mess.sentBy = this.props.user.userData._id;
        })

    }
    componentDidUpdate(prevProps) {
        if (prevProps.location.key !== this.props.location.key) {
            this.setState({ sending: true })
            this.props.dispatch(getGroupMessage(this.props.match.params.id)).then(data => {
                this.setState({ userName: this.props.messages.groupmesslist.user, _id: this.props.messages.groupmesslist._id })
                this.state.mess.sentTo = this.state._id;
                this.state.mess.sentBy = this.props.user.userData._id;
                this.setState({ sending: false })
            })


        }
        this.scrollToBottom();
    }
    scrollToBottom = () => {
        const messagesContainer = ReactDOM.findDOMNode(this.messagesContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    emojiClick = () => {
        this.setState({ emojiToggle: !this.state.emojiToggle })
    }
    GifIconClick = () => {
        this.setState({ gifToggle: !this.state.gifToggle })
    }
    handleChange = (event) => {
        this.setState({ content: event.target.value });
    }

    submitForm = (event) => {
        event.preventDefault();
        if (this.state.content.trim()) {
            this.state.mess.content = this.state.content;
            this.state.mess.type = 'text';
            let dataToSubmit = this.state.mess
            console.log(dataToSubmit)
            this.props.dispatch(sendGroupMessage(dataToSubmit));
            this.setState({ content: '', sending: true });
        }
    }
    onFileChange = async (event) => {
        this.setState({ sending: true });
        await this.props.dispatch(sendimg(event.target.files[0]));
        this.setState({ link: this.props.messages.sendimg ? this.props.messages.sendimg.url : 0 });
        this.state.mess.content = this.state.link;
        this.state.mess.type = 'img';
        let dataToSubmit = this.state.mess
        this.props.dispatch(sendGroupMessage(dataToSubmit));
        this.setState({ sending: true });
    }
    sendGif = (url) => {
        this.state.link = url;
        this.state.mess.content = this.state.link;
        this.state.mess.type = 'img';
        let dataToSubmit = this.state.mess
        this.props.dispatch(sendGroupMessage(dataToSubmit));
        this.setState({ sending: true });
    }
    sendHeartIcon = () => {
        this.setState({ sending: true });
        this.state.mess.content = this.state.heart;
        this.state.mess.type = 'sticker';
        let dataToSubmit = this.state.mess
        this.props.dispatch(sendGroupMessage(dataToSubmit));
        this.setState({ content: '', sending: true });
    }
    addEmoji = e => {
        const input = document.getElementById('description_textarea');
        var starPros = document.getElementById('description_textarea').selectionStart;
        var endPros = document.getElementById('description_textarea').selectionEnd;
        let event = e.native;
        var value = JSON.stringify(event);
        var emote = value.replace(/['"]+/g, '')
        // var unquoted = emote.replace(/(\{|,)\s*(.+?)\s*:/g, '$1 "$2":')
        this.setState({ content: this.state.content.substr(0, starPros) + emote + this.state.content.substr(endPros, this.state.content.length) });
        input.focus();
        document.execCommand("copy");
    };
    removelist = (id, name) => {
        const list = this.state.sendinguserlist;
        list.splice(this.state.sendinguserlist.indexOf(name), 1);
        this.setState({ sendinguserlist: list });
        const listid = this.state.sendinguserlistid;
        listid.splice(this.state.sendinguserlistid.indexOf(id), 1);
        this.setState({ sendinguserlistid: listid });
    };
    createGroup = (list) => {
        console.log('clicked');
        list.push(this.props.user.userData._id);
        this.props.dispatch(createGroup(list)).then(data => this.props.history.push(`/message/inbox/${this.props.messages.newgroup._id}`));
        this.setState({ newmess: false });

    };
    addList = (id, name) => {
        const list = this.state.sendinguserlist;
        list.push(name);
        this.setState({ sendinguserlist: list });
        const listid = this.state.sendinguserlistid;
        listid.push(id);
        this.setState({ sendinguserlistid: listid });
    }
    seenMessage = (id) => {
        this.props.dispatch(seenMessage(id))
    }
    editTitle = (id, title) => {
        this.props.dispatch(editTitle(id, title))
    }
    createGroupEvent = (des) => {
        this.setState({ sending: true });
        this.state.mess.content = des;
        this.state.mess.type = 'event';
        let dataToSubmit = this.state.mess
        this.props.dispatch(sendGroupMessage(dataToSubmit));
        this.setState({ content: '', sending: true });
    }
    addMember = (id, userlist, userlistid) => {
        this.props.dispatch(addMember(id, userlist, userlistid))
    }
    removeMember = (id, uid) => {
        this.props.dispatch(removeMember(id, uid))
    }
    onGroupImgChange = async (event) => {
        this.setState({ sending: true })
        await this.props.dispatch(uploadgroupimg(event.target.files[0]));
        await this.props.dispatch(changegroupimg(this.props.messages.groupmesslist._id, this.props.messages.img ? this.props.messages.img.url : ''))
            .then(response => {
                console.log(response)
                if (response.payload.success == false) {
                    this.setState({ loading: false })
                }
                else {
                    this.setState({ loading: false })
                }
            })
    }
    seenGroupMess = (id) => {
        this.props.dispatch(seenGroupMess(id))
    }
    outGroup = async (id, uid) => {
        await this.props.dispatch(removeMember(id, uid))
        await this.props.history.push('/message/inbox')
        await this.props.dispatch(getGroupMessage(this.props.match.params.id))
    }
    follow = async (id) =>{
        await this.props.dispatch(follow(id))
        await this.props.dispatch(auth())
    }
    unfollow = async (id) =>{
        await this.props.dispatch(unfollow(id))
        await this.props.dispatch(auth())
    }
    render() {

        console.log(this.props.messages)
        console.log(this.props.messages.grouplist)
        const mess = this.props.messages
        const yourProfile = this.props.user.userData
        return (
            <Layout>
                {/* {
                  this.props.messages ? this.props.messages.messlist ? this.props.messages.messlist.user1 ? this.props.messages.messlist.user1._id != this.props.user.userData._id ? 
                  this.setState({userName:this.props.messages.messlist.user1.userName,_id:this.props.messages.messlist.user1._id,avt:this.props.messages.messlist.user1.avt}) : '' :'':'':''
             } */}
                <div className="message_container">
                    <div className="message_wrapper">
                        <div className="row no-gutters">
                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-2 left_contain">
                                <div className="chat_info">
                                    <div className="chat_settings">
                                        <h2> Trò chuyện</h2>
                                        <div className="chat_icon">
                                            <Pencil onClick={() => this.setState({ newmess: true })} size={32} strokeWidth={1} color="black"></Pencil>

                                            <Settings size={32} strokeWidth={1} color="black"></Settings>

                                        </div>
                                    </div>
                                    <div className="search_box">
                                        <Search size={22} strokeWidth={1} color="grey" ></Search>
                                        <input type="text" placeholder="Tìm kiếm" />


                                    </div>


                                </div>

                                {/* <Conversation
                                            messages={this.props.messages}
                                            yourProfile={yourProfile}
                                            seenMessage={seenMessage}
                                        >
                                        </Conversation>  */}

                                <Group

                                    messages={this.props.messages}
                                    yourProfile={yourProfile}
                                    seenGroupMess={this.seenGroupMess}
                                >
                                </Group>

                            </div>
                            <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-10 right_contain">
                                <div className="top_info">

                                    <div className="user_info">
                                        {
                                           this.props.messages.groupmesslist ? this.props.messages.groupmesslist.type == 'personal' ?
                                           this.props.messages.groupmesslist.user.map(users => {
                                               return (
                                                   users._id == yourProfile._id ? '' : <img src={users.avt}></img>
                                               )

                                           }):
                                            this.props.messages.groupmesslist ? this.props.messages.groupmesslist.groupimg ?
                                                <img src={this.props.messages.groupmesslist.groupimg}></img>
                                                :
                                                <AvatarGroup max={3}>
                                                    {
                                                        this.props.messages.groupmesslist ? this.props.messages.groupmesslist.user ? this.props.messages.groupmesslist.user.map(users => {
                                                            return (
                                                                <Avatar src={users ? users.avt : ''}></Avatar>
                                                            )
                                                        }) : '' : ''
                                                    }
                                                </AvatarGroup>
                                                : '':''
                                        }
                                        {
                                             this.props.messages.groupmesslist ? this.props.messages.groupmesslist.type == 'personal' ?
                                             this.props.messages.groupmesslist.user.map(users => {
                                                 return (
                                                     users._id == yourProfile._id ? '' : <h2>{users.userName}</h2>
                                                 )
  
                                             }):
                                            this.props.messages.groupmesslist ? this.props.messages.groupmesslist.title ?
                                                <h2>{this.props.messages.groupmesslist.title}</h2>
                                                :
                                                this.props.messages.groupmesslist ? this.props.messages.groupmesslist.user ? this.props.messages.groupmesslist.user.map(users => {
                                                    return (
                                                        <h2>{users.userName},</h2>
                                                    )
                                                }) : '' : '' : '':''

                                        }

                                    </div>
                                   
                                        <Dots size={24} strokeWidth={0} fill="black" onClick={() => this.setState({ editmess: true })}></Dots>

                                </div>
                                {
                                    this.state.sending == true ? <LinearProgress />
                                        : ''
                                }
                                <div className="message" ref={(el) => { this.messagesContainer = el; }} >

                                    {
                                        this.props.messages.messlist ? this.props.messages.messlist.messagelist ? this.props.messages.messlist.messagelist.map(mess => {

                                            return (
                                                <Mess
                                                    mess={mess}
                                                    yourProfile={yourProfile}
                                                    seenMessage={this.props.seenMessage}
                                                />

                                            )
                                        }
                                        ) : '' : ''
                                    }
                                    {
                                        this.props.messages.groupmesslist ? this.props.messages.groupmesslist.messagelist ? this.props.messages.groupmesslist.messagelist.map(mess => {

                                            return (
                                                <GroupMess
                                                    mess={mess}
                                                    yourProfile={yourProfile}
                                                // seenMessage={this.props.seenMessage}
                                                />

                                            )
                                        }
                                        ) : '' : ''
                                    }

                                    <div className="row no-gutters sent">
                                        <div className="col-xl-6">
                                        </div>
                                        <div className="col-xl-6 sent_mess">
                                            {

                                                this.props.messages.groupmesslist ? this.props.messages.groupmesslist.seenBy ? this.props.messages.groupmesslist.seenBy.map(seen => {
                                                    return (
                                                        <img className="seen_avt" src={seen.avt}></img>
                                                    )
                                                }
                                                ) : '' : ''

                                            }
                                        </div>

                                    </div>

                                    {
                                        this.state.gifToggle ?
                                            <div className="gif_picker" style={{ position: 'fixed', zIndex: 100, top: "32%", left: "50%" }}> <GifPicker apiKey={"xRQzMksF1tPmqAvVPYlIGeJHZ2EBVXyh"} onSelected={(gif) => this.sendGif(gif.downsized.url)}></GifPicker></div>
                                            : null
                                    }
                                </div>

                                {

                                    this.state.mess.sentTo?
                                    <form onSubmit={(event) => this.submitForm(event)}>

                                        <div className="chat_box">
                                            <div className="chat_area">

                                                {/* <input value={this.state.mess.sentTo} hidden="true" type="text" placeholder="Nhập tin nhắn...."></input>
                                          <input value={this.state.mess.sentBy} hidden="true" type="text" placeholder="Nhập tin nhắn...."></input> */}
                                                <input id="description_textarea" type="text" value={this.state.content} placeholder="Nhập tin nhắn...." onChange={(event) => { this.handleChange(event) }}></input>
                                                <div className="action_icon" onClick={this.sendHeartIcon}>
                                                    <Heart size={32} strokeWidth={1} color="black"></Heart>
                                                </div>
                                                <div className="action_icon" onClick={this.GifIconClick}>
                                                    <Ghost size={32} strokeWidth={1} color="black"> </Ghost>
                                                </div>
                                            </div>
                                            <div className="img_upload">
                                                <label className="custom-file-upload">
                                                    <input type="file" onChange={(event) => this.onFileChange(event)} />
                                                    <Photo size={32} strokeWidth={1} color="black"></Photo>

                                                </label>
                                            </div>
                                            <div className="emoji_icon">
                                                <Sticker onClick={this.emojiClick} size={32} strokeWidth={1} color="black"></Sticker>

                                                {
                                                    this.state.emojiToggle ?
                                                        <Picker style={{ position: "absolute", right: 0, top: "20%" }} onSelect={this.addEmoji} />
                                                        : null
                                                }


                                            </div>
                                            <div id="sent_btn" className="send_icon" onClick={(event) => { this.submitForm(event) }}>
                                                <Send size={32} strokeWidth={1} color="white"></Send>
                                            </div>
                                        </div>
                                    </form>:''
                                }

                            </div>
                        </div>
                    </div>
                </div>
                <Dialog open={this.state.newmess} onClose={() => this.setState({ newmess: false })}>
                    <div className="newmess_contain">
                        <div className="newmess_header">

                            <h5>Gửi tin nhắn mới</h5>

                            <h6 className={this.state.sendinguserlist.length > 0 ? "active" : "disable"} onClick={() => this.createGroup(this.state.sendinguserlistid)}>Tiếp</h6>
                        </div>
                        <hr></hr>
                        <div className="search">

                            {
                                this.state.sendinguserlist.map(sendlist => {
                                    return (
                                        <StyleClip label={sendlist} color="primary" onDelete={() => { this.removelist(sendlist) }}></StyleClip>

                                    )
                                })
                            }
                            <SearchBar sendinguserlistid={this.state.sendinguserlistid} removelist={this.removelist} addList={this.addList} />
                        </div>
                        <hr></hr>
                        <div className="suggest">
                            <h6>Gợi ý</h6>
                            {
                                this.props.messages ?
                                    this.props.messages.grouplist ?
                                        this.props.messages.grouplist.map(con => {
                                            return (
                                                <div>
                                                    {

                                                        <div className="user_contain">
                                                            <div className="uinfo">
                                                                <img src={con.user[0].avt}></img>
                                                                <h2>{con.user[0].userName}</h2>
                                                            </div>

                                                            <Checkbox
                                                                icon={<Circle size={24} strokeWidth={0.5} color="grey"></Circle>}
                                                                checkedIcon={<CircleCheck size={24} strokeWidth={0.5} color="white" fill="#00abfb"></CircleCheck>}

                                                                checked={this.state.sendinguserlistid.includes(con.user[0]._id)}

                                                                onChange={() =>
                                                                    this.state.sendinguserlistid.includes(con.user[0]._id) ?
                                                                        this.removelist(con.user[0]._id, con.user[0].userName) :
                                                                        this.addList(con.user[0]._id, con.user[0].userName)
                                                                }
                                                            // checked={checked}
                                                            // onChange={handleChange}
                                                            // inputProps={{ 'aria-label': 'controlled' }}
                                                            />
                                                        </div>
                                                        // :                                                        
                                                        // <div className="user_contain">
                                                        //   <img src={con.user2.avt}></img>
                                                        //     <h2>{con.user2.userName}</h2>

                                                        // </div>

                                                    }
                                                </div>)
                                        }) : '' : ''
                            }
                        </div>
                    </div>
                </Dialog>
                {
                    <Dialog open={this.state.editmess} onClose={() => this.setState({ editmess: false })}>
                        <EditMess history={this.props.history} follow={this.follow} unfollow={this.unfollow} outGroup={this.outGroup} onGroupImgChange={this.onGroupImgChange} createGroupEvent={this.createGroupEvent} editTitle={this.editTitle} conversation={this.props.messages.groupmesslist} yourProfile={yourProfile} addMember={this.addMember} removeMember={this.removeMember}>
                        </EditMess>
                    </Dialog>
                }
            </Layout>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        user: state.user,
        messages: state.messages
    }
}
export default connect(mapStateToProps)(Message);