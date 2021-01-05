import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import Skeleton from '@material-ui/lab/Skeleton'
import { getMessage, getConversation,sendMessage,seenMessage,sendimg} from '../../../src/actions/message_action'
import './Message.scss';
import { update, generateData } from '../ultils/Form/FormActions';
import { Link, withRouter } from 'react-router-dom';
import { GridDots, LayoutList, Edit, Settings, LayoutGrid, Tag, Dots, CircleX, Heart, Message2, Bookmark, Pencil, Search, Point, Photo, Sticker, Send } from 'tabler-icons-react'
import Pusher from 'pusher-js'
import { Button,LinearProgress} from '@material-ui/core';

class Message extends Component {
    state = {

        userName: null,
        sending:false,
        _id: null,
        avt: null,
        content:'',
        mess :{
            sentTo:'',
            sentBy:'',
            content:'',
            type:'',
        }
    }
    componentDidMount(){
        this.props.dispatch(getMessage(this.props.match.params.id)).then(
            this.props.dispatch(getConversation())
        )
        this.props.dispatch(getMessage(this.props.match.params.id)).then(data => {
            if (this.props.messages.messlist.user1._id != this.props.user.userData._id) { this.setState({ userName: this.props.messages.messlist.user1.userName, _id: this.props.messages.messlist.user1._id, avt: this.props.messages.messlist.user1.avt }) }
            else { this.setState({ userName: this.props.messages.messlist.user2.userName, _id: this.props.messages.messlist.user2._id, avt: this.props.messages.messlist.user2.avt }) } 
            this.props.dispatch(getConversation())
            this.state.mess.sentTo=this.state._id;
            this.state.mess.sentBy=this.props.user.userData._id
        })
        /// Bind với pusher để làm realtime
        const pusher = new Pusher('c0e96b0fff8d0edac17d', {
            cluster: 'mt1'
        });
        const channel = pusher.subscribe('messages');
        channel.bind('newMessage', data => {
            if(data.change.fullDocument.sentTo==this.props.user.userData._id || data.change.fullDocument.sentBy==this.props.user.userData._id){
                this.props.dispatch(getConversation())
                this.props.dispatch(this.props.dispatch(getMessage(this.props.match.params.id)))
                this.setState({sending:false})
            }
        });
        const conver = pusher.subscribe('conversations');
        conver.bind('changeConver',data=>{
            if(data.change.documentKey._id==this.props.messages.messlist._id){
                this.props.dispatch(this.props.dispatch(getMessage(this.props.match.params.id)))
            }
        })
    }
       componentDidUpdate (prevProps) {
              if (prevProps.location.key !== this.props.location.key) {
            this.setState({sending:true})
            this.props.dispatch(getMessage(this.props.match.params.id)).then(
                this.props.dispatch(getConversation())
            )
          this.props.dispatch(getMessage(this.props.match.params.id)).then(data => {
                if (this.props.messages.messlist.user1._id != this.props.user.userData._id) { this.setState({ userName: this.props.messages.messlist.user1.userName, _id: this.props.messages.messlist.user1._id, avt: this.props.messages.messlist.user1.avt }) }
                else { this.setState({ userName: this.props.messages.messlist.user2.userName, _id: this.props.messages.messlist.user2._id, avt: this.props.messages.messlist.user2.avt }) }
                this.props.dispatch(getConversation())
                this.state.mess.sentTo=this.state._id;
            this.state.mess.sentBy=this.props.user.userData._id
            this.setState({sending:false})
            })
       
        }
    }
    handleChange=(event) => {
       this.setState({content:event.target.value});   
    }
    submitForm=(event)=>{
        event.preventDefault();
        this.state.mess.content=this.state.content;
        this.state.mess.type='text';
        let dataToSubmit = this.state.mess
        this.props.dispatch(sendMessage(dataToSubmit));
        this.setState({content:'',sending:true});
    }
    onFileChange = async (event) => {
        this.setState({ sending: true });
        await this.props.dispatch(sendimg(event.target.files[0]))
        this.setState({content:this.props.messages.sendimg ? this.props.messages.sendimg.url : 0})
        this.state.mess.content=this.state.content;
        this.state.mess.type='img';
        let dataToSubmit = this.state.mess
        this.props.dispatch(sendMessage(dataToSubmit));
        this.setState({content:'',sending:true});
    }
    // handleSeen = (id)=> {
    //     alert('Đã click',id);
    // }
    render() {
        
        console.log(this.props.messages)
     
        // console.log(this.props.messlist)
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
                            <div className="col-xl-4 left_contain">
                         
                                <div className="chat_info">
                                    <div className="chat_settings">
                                        <h2> Trò chuyện</h2>
                                        <div className="chat_icon">
                                            <Pencil size={32} strokeWidth={1} color="black"></Pencil>

                                            <Settings size={32} strokeWidth={1} color="black"></Settings>

                                        </div>
                                    </div>
                                    <div className="search_box">
                                        <Search size={22} strokeWidth={1} color="grey" ></Search>
                                        <input type="text" placeholder="Tìm kiếm tin nhắn..." />
                                    </div>
                                </div>
                                <div className="message_box">
                                    {this.props.messages ? console.log(this.props.messages): ""}
                                    {
                                        
                                        this.props.messages ?
                                        this.props.messages.conlist ? 
                                            this.props.messages.conlist.map(con => {
                                            return (
                                                <div>
                                                    {
                                                    
                                                        //Nếu user đã xem
                                                    con.seenBy.includes(yourProfile._id)?
                                                        con.user1._id != yourProfile._id ?
                                                            <Link className="link" to={`/message/inbox/${con.user1._id}`}>
                                                                <div className="row no-gutters message_contain">
                                                                    <div className="col-xl-2 avt">
                                                                        <img src={con.user1.avt}></img>
                                                                    </div>
                                                                    <div className="col-xl-8 message">
                                                                        <h2>{con.user1.userName}</h2>
                                                                        <h6>{con.lastMess? con.lastMess.sentBy==yourProfile._id?'Bạn: ':'':''} {con.lastMess ? con.lastMess.type=='img'?'Đã gửi một hình ảnh':con.lastMess.content:''}</h6>
                                                                    </div>
                                                                    <div className="col-xl-2 info">
                                                                    <h6><Point visibility="hidden" size={24} strokeWidth={0} fill="#7166F9"></Point></h6>
                                                                        <h6>6 mins</h6>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                            :
                                                            <Link className="link" to={`/message/inbox/${con.user2._id}`}>
                                                                <div className="row no-gutters message_contain">
                                                                    <div className="col-xl-2 avt">
                                                                        <img src={con.user2.avt}></img>
                                                                    </div>
                                                                    <div className="col-xl-8 message">
                                                                        <h2 >{con.user2.userName}</h2>
                                                                        <h6>{con.lastMess? con.lastMess.sentBy==yourProfile._id?'Bạn: ':'':''}
                                                                        {con.lastMess ? con.lastMess.type=='img'?'Đã gửi một hình ảnh':con.lastMess.content:''}</h6>
                                                                    </div>
                                                                    <div className="col-xl-2 info">
                                                                    <h6><Point visibility="hidden" size={24} strokeWidth={0} fill="#7166F9"></Point></h6>
                                                                        <h6>6 mins</h6>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                    :
                                                    //Nếu user chưa xem
                                                    con.user1._id != yourProfile._id ?
                                                    <Link className="link" to={`/message/inbox/${con.user1._id}`}  onClick={()=>this.props.dispatch(seenMessage(con.user1._id))}>
                                                        <div className="row no-gutters message_contain unseen">
                                                            <div className="col-xl-2 avt">
                                                                <img src={con.user1.avt}></img>
                                                            </div>
                                                            <div className="col-xl-8 message">
                                                                <h2>{con.user1.userName}</h2>
                                                                <h6>{con.lastMess? con.lastMess.sentBy==yourProfile._id?'Bạn: ':'':''}{con.lastMess ? con.lastMess.type=='img'?'Đã gửi một hình ảnh':con.lastMess.content:''}</h6>
                                                            </div>
                                                            <div className="col-xl-2 info">
                                                                <h6><Point size={24} strokeWidth={0} fill="#7166F9"></Point></h6>
                                                                <h6>6 mins</h6>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    :
                                                    <Link className="link" to={`/message/inbox/${con.user2._id}`}  onClick={()=>this.props.dispatch(seenMessage(con.user2._id))}>
                                                        <div className="row no-gutters message_contain unseen">
                                                            <div className="col-xl-2 avt">
                                                                <img src={con.user2.avt}></img>
                                                            </div>
                                                            <div className="col-xl-8 message">
                                                                <h2 >{con.user2.userName}</h2>
                                                                <h6>{con.lastMess? con.lastMess.sentBy==yourProfile._id?'Bạn: ':'':''}{con.lastMess ? con.lastMess.type=='img'?'Đã gửi một hình ảnh':con.lastMess.content:''}</h6>
                                                            </div>
                                                            <div className="col-xl-2 info">
                                                                <h6><Point size={24} strokeWidth={0} fill="#7166F9"></Point></h6>
                                                                <h6>6 mins</h6>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    }
                                                </div>
                                            )
                                        }
                                        ) : ''
                                        : ''
                                    }
                                    

                                </div>
                            </div>
                            <div className="col-xl-8 right_contain">
                                <div className="top_info">
                            
                                    <div className="user_info">
                                  
                                        <img src={this.state.avt}></img>
                                        <h2>{this.state.userName}</h2>
                                    </div>
                                    <Dots size={24} strokeWidth={0} fill="black"></Dots>

                                  
                                </div>
                                {
                                        this.state.sending == true ?  <LinearProgress/>
                                        :''
                                    }
                                <div className="message">

                                    {
                                       this.props.messages.messlist ? this.props.messages.messlist.messagelist ? this.props.messages.messlist.messagelist.map(mess => {
                                            return (
                                                mess.sentBy == yourProfile._id ?
                                                    <div className="row no-gutters sent">
                                                        <div className="col-xl-6">
                                                        </div>
                                                        <div className="col-xl-6 sent_mess">
                                                        {
                                                                    mess.type=='text'?
                                                                
                                                            <p>
                                                                
                                                                {mess.content}
                                                            </p>
                                                            :                                                 
                                                                <img src={mess.content}></img>
                                                       }    
                                                        </div>
                                                        
                                                    </div> :
                                                    <div className="row no-gutters receive">
                                                        
                                                        <div className="col-xl-6 receive_mess">

                                                        {
                                                                    mess.type=='text'?
                                                                
                                                            <p>
                                                                
                                                                {mess.content}
                                                            </p>
                                                            :                                                 
                                                                <img src={mess.content}></img>
                                                       }    
                                                        </div>
                                                        <div className="col-xl-6">
                                                        </div>
                                                    </div>
                                            )
                                        }
                                        ) : '' : ''
                                    }
                                    
                                    {
                                this.props.messages.messlist?this.props.messages.messlist.lastMess?this.props.messages.messlist.lastMess.sentBy==yourProfile._id?
                                (this.props.messages.messlist?this.props.messages.messlist.seenBy.includes(this.state._id)?
                                    <div className="row no-gutters sent">
                                                        <div className="col-xl-6">
                                                        </div>
                                                        <div className="col-xl-6 sent_mess">
                                                       <h5> Đã xem</h5>
                                                               
                                                            
                                                        </div>
                                                        
                                    </div>
                                    :<div className="row no-gutters sent">
                                    <div className="col-xl-6">
                                    </div>
                                    <div className="col-xl-6 sent_mess">
                                    <h5> Đã gửi</h5>
                                                               
                                     </div>
                                  
                                     </div>:''):'':'':''
                                    
                                }
                                </div>
                                <form onSubmit={(event) => this.submitForm(event)}>
                                <div className="chat_box">
                                    <div className="chat_area">
                                         {/* <input value={this.state.mess.sentTo} hidden="true" type="text" placeholder="Nhập tin nhắn...."></input>
                                          <input value={this.state.mess.sentBy} hidden="true" type="text" placeholder="Nhập tin nhắn...."></input> */}
                                          <input type="text" value={this.state.content} placeholder="Nhập tin nhắn...." onChange={(event) => { this.handleChange(event) }}></input>
                                            <div className="action_icon">
                                            
                                            <Heart size={32} strokeWidth={1} color="black"></Heart>
                                        </div>
                                    </div>
                                    <div className="emoji_icon">
                                    <label className="custom-file-upload">
                                                    <input type="file" onChange={this.onFileChange} />
                                                    <Photo size={32} strokeWidth={1} color="black"></Photo>
                                    </label>
                                    </div>
                                    <div className="emoji_icon">
                                        <Sticker size={32} strokeWidth={1} color="black"></Sticker>
                                    </div>
                                    <div className="send_icon" onClick={(event) => { this.submitForm(event) }}>
                                        <Send size={32} strokeWidth={1} color="white"></Send>
                                    </div>
                                </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
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