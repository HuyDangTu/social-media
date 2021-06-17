import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import Skeleton from '@material-ui/lab/Skeleton'
import Portal from '@material-ui/core/Portal';
import { getMessage, getConversation, sendMessage, seenMessage, sendimg, getGroup,seenAll, getGroupMessage, sendGroupMessage, createGroup, findPersonal ,editTitle, addMember, removeMember, changegroupimg, uploadgroupimg, seenGroupMess, disableGroupMess } from '../../../src/actions/message_action'
import { follow, unfollow,auth } from '../../../src/actions/user_action'
import GroupMess from './groupmess';
import './Message.scss';
import { update, generateData } from '../ultils/Form/FormActions';
import { Link, withRouter } from 'react-router-dom';
import { Settings, Dots, Heart, Pencil, Search,Phone, Photo, Sticker, Send, Ghost, Edit, Circle, CircleCheck, User, Users } from 'tabler-icons-react';
import SearchBar from './SearchBar/index'
import Pusher, { Members } from 'pusher-js'
import { Button, Dialog, LinearProgress, Checkbox, Chip, Avatar, ClickAwayListener } from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import EditMess from './editchat'
import ReactDOM from 'react-dom'
import { Picker } from 'emoji-mart'
import Picker2 from 'react-giphy-component'
import styled from 'styled-components'
import moment from 'moment';
import Group from './group';

const GifPicker = styled(Picker2)`
`;
const StyleLink = styled(Link)`
color:black;
`;

const StyleClip = styled(Chip)`
border-radius: 4px;
background-color: #e1f5fe;
margin: 4px;
`;

class VideoCall extends Component {
  
    prepareCaller= ()=>{
        //Initializing a peer connection
        caller = new window.RTCPeerConnection();
        //Listen for ICE Candidates and send them to remote peers
        caller.onicecandidate = (evt)=> {
            if (!evt.candidate) return;
            console.log("onicecandidate called");
            onIceCandidate(caller, evt);
        };
        //onaddstream handler to receive remote feed and show in remoteview video element
        caller.onaddstream = (evt)=> {
            console.log("onaddstream called");
            if (window.URL) {
                document.getElementById("remoteview").srcObject = evt.stream;
            } else {
                document.getElementById("remoteview").src = evt.stream;
            }
        };
    }
    getCam = () => {
        //Get local audio/video feed and show it in selfview video element 
        return navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
    }

    GetRTCIceCandidate= () =>{
        window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate ||
            window.mozRTCIceCandidate || window.msRTCIceCandidate;

        return window.RTCIceCandidate;
    }

    GetRTCPeerConnection=() =>{
        window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection ||
            window.mozRTCPeerConnection || window.msRTCPeerConnection;
        return window.RTCPeerConnection;
    }

    GetRTCSessionDescription= ()=> {
        window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription ||
            window.mozRTCSessionDescription || window.msRTCSessionDescription;
        return window.RTCSessionDescription;
    }

    //Create and send offer to remote peer on button click
    callUser= (user) => {
        this.getCam()
            .then(stream => {
                if (window.URL) {
                    document.getElementById("selfview").srcObject  =  stream;
                } else {
                    document.getElementById("selfview").src = stream;
                }
                this.toggleEndCallButton();
                caller.addStream(stream);
                localUserMedia = stream;
                caller.createOffer().then((desc) => {
                    caller.setLocalDescription(new RTCSessionDescription(desc));
                    this.props.channel.trigger("client-sdp", {
                        "sdp": desc,
                        "room": user,
                        "from": id
                    });
                    room = user;
                });
            
            })
            .catch(error => {
                console.log('an error occured', error);
            })
    };

    endCall= ()=>{
        room = undefined;
        caller.close();
        for (let track of localUserMedia.getTracks()) { track.stop() }
        prepareCaller();
        toggleEndCallButton();
    }

   endCurrentCall= ()=>{
        
        this.props.channel.trigger("client-endcall", {
                "room": room
            });

        endCall();
    }
    onIceCandidate = (peer, evt)=> {
        if (evt.candidate) {
            this.props.channel.trigger("client-candidate", {
                "candidate": evt.candidate,
                "room": room
            });
        }
    }

    toggleEndCallButton= ()=>{
        if(document.getElementById("endCall").style.display == 'block'){
            document.getElementById("endCall").style.display = 'none';
        }else{
            document.getElementById("endCall").style.display = 'block';
        }
    }


    componentDidMount (){

        //To iron over browser implementation anomalies like prefixes
        GetRTCPeerConnection();
        GetRTCSessionDescription();
        GetRTCIceCandidate();
        prepareCaller();
    
        //Send the ICE Candidate to the remote peer
        //Listening for the candidate message from a peer sent from onicecandidate handler
        this.props.channel.bind("client-candidate", (msg)=> {
          
            if(msg.room==room){
                console.log("candidate received");
                caller.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
        });
    
        //Listening for Session Description Protocol message with session details from remote peer
        this.props.channel.bind("client-sdp", msg => {
            if(msg.room == id){
                var sessionDesc = new RTCSessionDescription(msg.sdp);
                        caller.setRemoteDescription(sessionDesc);
                console.log("sdp received");
                var answer = confirm("You have a call from: "+ msg.from + "Would you like to answer?");
                if(!answer){
                    return this.props.channel.trigger("client-reject", {"room": msg.room, "rejected":id});
                }
                room = msg.room;
                this.getCam()
                    .then(stream => {
                        localUserMedia = stream;
                        this.toggleEndCallButton();
                        if (window.URL) {
                            document.getElementById("selfview").srcObject = stream;
                        } else {
                            document.getElementById("selfview").src = stream;
                        }
                        caller.addStream(stream);
    
                        caller.createAnswer().then(sdp=> {
                            caller.setLocalDescription(new RTCSessionDescription(sdp));
                            this.props.channel.trigger("client-answer", {
                                "sdp": sdp,
                                "room": room
                            });
                        });
    
                    })
                    .catch(error => {
                        console.log('an error occured', error);
                    })
            }
            
    
        });
    
        //Listening for answer to offer sent to remote peer
        this.props.channel.bind("client-answer", (answer)=> {
            if(answer.room==room){
                console.log("answer received");
                caller.setRemoteDescription(new RTCSessionDescription(answer.sdp));
            }
        });
    
        this.props.channel.bind("client-reject", (answer)=> {
            if(answer.room==room){
                console.log("Call declined");
                alert("call to " + answer.rejected + "was politely declined");
                endCall();
            }
            
        });
         this.props.channel.bind("client-endcall", answer=> {
            if(answer.room==room){
                console.log("Call Ended");
                endCall();
                
            }
        });
    }
    return (
    ){
        return(
            <div id="app">
            <span id="myid"> </span>
            <video id="selfview" autoplay></video>
            <video id="remoteview" autoplay></video>
            <button id="endCall" style="display: none;" onclick={()=>this.endCurrentCall()}>End Call </button>
            <div id="list">
                <ul id="users">
    
                </ul>
            </div>
        </div>
        )
    }
}
export default VideoCall