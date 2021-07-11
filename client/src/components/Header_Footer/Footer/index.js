import React, { Component } from 'react';
import './footer.scss'
import Pusher, { Members } from 'pusher-js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faCompass from '@fortawesome/fontawesome-free-solid/faCompass';
import faPhone from '@fortawesome/fontawesome-free-solid/faPhone';
import faClock from '@fortawesome/fontawesome-free-solid/faClock';
import faEnvelope from '@fortawesome/fontawesome-free-solid/faEnvelope';
import Collapse from '@material-ui/core/Collapse'
import { Point, Phone, Video, Microphone, MicrophoneOff, VideoOff, X } from 'tabler-icons-react'
import Card from '@material-ui/core/Card';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom'

class Footer extends Component {
    state = {
        checked: false,
        onlineusers: [],
        calling: false,
    }
    constructor(props) {
        super(props)
        this.sessionDesc = null;
        this.currentcaller = null;
        this.room = null;
        this.caller = null;
        this.localUserMedia = null;
        this.id = null;
        this.userName = null;
        this.avt=null;
        this.channel = null;
        this.usersOnline = 0;
    }
    prepareCaller= ()=>{
        //Initializing a peer connection
        
        var servers = { 'iceServers': [
            {
              url: 'stun:global.stun.twilio.com:3478?transport=udp',
              urls: 'stun:global.stun.twilio.com:3478?transport=udp'
            },
            {
              url: 'turn:global.turn.twilio.com:3478?transport=udp',
              username: '82a4ba095072d36772b627702bac0cb55af1f231adc6164666ac858ba6b4f497',
              urls: 'turn:global.turn.twilio.com:3478?transport=udp',
              credential: 'QGaYzNHQ7JzVpc5n3032E1gHRELvW3vsWCe7+7dh1B4='
            },
            {
              url: 'turn:global.turn.twilio.com:3478?transport=tcp',
              username: '82a4ba095072d36772b627702bac0cb55af1f231adc6164666ac858ba6b4f497',
              urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
              credential: 'QGaYzNHQ7JzVpc5n3032E1gHRELvW3vsWCe7+7dh1B4='
            },
            {
              url: 'turn:global.turn.twilio.com:443?transport=tcp',
              username: '82a4ba095072d36772b627702bac0cb55af1f231adc6164666ac858ba6b4f497',
              urls: 'turn:global.turn.twilio.com:443?transport=tcp',
              credential: 'QGaYzNHQ7JzVpc5n3032E1gHRELvW3vsWCe7+7dh1B4='
            }
          ]};
        this.caller = new window.RTCPeerConnection(servers);
        //Listen for ICE Candidates and send them to remote peers
        this.caller.onicecandidate = (evt)=> {
            if (!evt.candidate) return;
            console.log("onicecandidate called");
            this.onIceCandidate(this.caller, evt);
        };
        //onaddstream handler to receive remote feed and show in remoteview video element
        this.caller.onaddstream = (evt)=> {
            console.log("onaddstream called");
            if (window.URL) {
                document.getElementById("remoteview").srcObject = evt.stream;   
                document.getElementById("remoteview").play();
              //  ReactDOM.findDOMNode(this.remoteview).muted=false;
            } else {
                document.getElementById("remoteview").src = evt.stream;
                document.getElementById("remoteview").play();
               // ReactDOM.findDOMNode(this.remoteview).muted=false;
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
    callUser = (user) => {
       
        this.getCam()
            .then(stream => {
                if (window.URL) {
                    document.getElementById("selfview").srcObject = stream;
                    document.getElementById("selfview").play()
                    // document.getElementById("selfview").srcObject  =  stream;
                } else {
                    document.getElementById("selfview").src = stream;
                    document.getElementById("selfview").play()
                }
               
                this.caller.addStream(stream);
                this.localUserMedia = stream;
                this.caller.createOffer().then((desc) => {
                    this.caller.setLocalDescription(new RTCSessionDescription(desc));
                    this.channel.trigger("client-sdp", {
                        "sdp": desc,
                        "room": user,
                        "from": this.id,
                        "userName": this.props.user.userData.userName,
                        "avt": this.props.user.userData.avt
                    });
                    this.room = user;
                });
            
            })
            .catch(error => {
                console.log('an error occured', error);
            })
    };

    endCall = ()=>{
        this.room = null;
        this.caller.close();
        // ReactDOM.findDOMNode(this.remoteview).stop()
        // ReactDOM.findDOMNode(this.selfview).stop()
        for (let track of this.localUserMedia.getTracks()) { track.stop() }
        this.prepareCaller();
        ReactDOM.findDOMNode(this.videocall_contain).style.display ='none';
    }

   endCurrentCall= ()=>{
        this.channel.trigger("client-endcall", {
                "room": this.room
            });
        this.endCall();
    }
    onIceCandidate = (peer, evt)=> {
        if (evt.candidate) {
            this.channel.trigger("client-candidate", {
                "candidate": evt.candidate,
                "room": this.room
            });
        }
    }

  

    setVisable = ()=>{
        ReactDOM.findDOMNode(this.videocall_contain).style.display ='block';
    }

    toggleCallUser = async (userid) =>{
       await this.setVisable()
       await this.callUser(userid)
    }

  
    componentDidMount() {
    const script = document.createElement("script");
    script.src = "https://js.pusher.com/4.1/pusher.min.js";
    script.async = true;

  
    //For head
    document.head.appendChild(script);

    // For body
    document.body.appendChild(script);

    // For component
 //   this.div.appendChild(script);
        const list = this.state.onlineusers;
        const pusher = new Pusher('c0e96b0fff8d0edac17d', {
            cluster: 'mt1',
            encrypted: true,
            authEndpoint: `http://localhost:3002/api/pusher/auth/${this.props.user.userData._id}`,
        });
        var users = [],
            sessionDesc,
            caller, localUserMedia;
        this.channel = pusher.subscribe('presence-videocall');
        this.channel.bind('pusher:subscription_succeeded', (members) => {
            var me = this.channel.members.me;
            this.usersOnline = this.channel.members.count;
            this.id = me.id;
            console.log(this.channel.members.me)

            //  document.getElementById('myid').innerHTML = ` My caller id is : ` + id;
            this.channel.members.each((member) => {
                if (member.id != me.id) {
                    list.push(member.info);
                }
                console.log(list)
            });
            this.setState({ onlineusers: list })
        })
        
        this.channel.bind('pusher:member_added', (member) => {
            list.push(member.info)
            this.setState({ onlineusers: list })
        });
        this.channel.bind('pusher:member_removed', (member) => {
            // for remove member from list:
            var index = users.indexOf(member.id);
            list.splice(index, 1);
            // if(member.id==room){
            //     endCall();
            // }
            this.setState({ onlineusers: list })
        });
        this.GetRTCPeerConnection();
        this.GetRTCSessionDescription();
        this.GetRTCIceCandidate();
        this.prepareCaller();
      

this.channel.bind("client-candidate", (msg)=> {
      
        if(msg.room==this.room){
            console.log("candidate received");
           this.caller.addIceCandidate(new RTCIceCandidate(msg.candidate));
        }
    });

    //Listening for Session Description Protocol message with session details from remote peer
    this.channel.bind("client-sdp", (msg) =>{
        if(msg.room == this.id){
            var sessionDesc = new RTCSessionDescription(msg.sdp);
                    this.caller.setRemoteDescription(sessionDesc);
            console.log("sdp received");
            var answer = window.confirm("Bạn có cuộc gọi từ: "+ msg.userName + " bạn có muốn nhận?");
            if(!answer){
                return this.channel.trigger("client-reject", {"room": msg.room, "rejected":this.id});
            }
            ReactDOM.findDOMNode(this.videocall_contain).style.display ='block';
            this.room = msg.room;
            this.getCam()
                .then(stream => {
                    this.localUserMedia = stream;
                    if (window.URL) {
                        document.getElementById("selfview").srcObject = stream;
                        document.getElementById("selfview").play()
                    } else {

                        document.getElementById("selfview").src = stream;
                        document.getElementById("selfview").play()
                    }
                    this.caller.addStream(stream);

                    this.caller.createAnswer().then((sdp)=> {
                        this.caller.setLocalDescription(new RTCSessionDescription(sdp));
                        this.channel.trigger("client-answer", {
                            "sdp": sdp,
                            "room": this.room
                        });
                    });

                })
                .catch(error => {
                    console.log('an error occured', error);
                })
        }
        

    });

    //Listening for answer to offer sent to remote peer
    this.channel.bind("client-answer", (answer) => {
        if(answer.room==this.room){
            console.log("answer received");
            this.caller.setRemoteDescription(new RTCSessionDescription(answer.sdp));
        }
    });

    this.channel.bind("client-reject", (answer)=> {
        if(answer.room==this.room){
            console.log("Call declined");
            alert("call to " + answer.rejected + "was politely declined");
            ReactDOM.findDOMNode(this.videocall_contain).style.display ='none';
            this.endCall();
        }
        
    });

     this.channel.bind("client-endcall", (answer) =>{
        if(answer.room==this.room){
            console.log("Call Ended");
            this.endCall();
        }
        
    });

    }
    render() {
        return (
            <div>
                <div  id="videocall_contain" ref={(n) => this.videocall_contain = n} >
                    <div className="videocall">
                        <video muted="muted"  id="selfview" ref={(n) => this.selfview = n} autoplay></video>
                        <video muted="muted" id="remoteview" ref={(n) => this.remoteview = n} autoplay></video>
                        <div className="action_button">
                            <Video strokeWidth={1} fill="white" color="#7166F9" id="video_button" size={30}> </Video>
                            <Microphone strokeWidth={1.5} color="white" id="audio_button" size={30}></Microphone>
                            <X onClick={()=>this.endCurrentCall()} strokeWidth={1.5} color="white" id="exit_button" size={30}> </X>
                        </div>
                    </div>

                </div>
                <div className="footer container-fluid" >
                    <div className="footer__container container-fluid">

                        <div className="row no-gutters">
                            <div className="col-lg-9 col-md-6 col-sm-4 col-4 no-gutters">
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-8 col-8  no-gutters">
                                <div className="footer__container__left">
                                    <Collapse onClick={() => this.setState({ checked: !this.state.checked })} in={this.state.checked} collapsedHeight={40}>
                                        <Card >
                                            <div className="active_footer">
                                                <div className="title_footer">
                                                    <h4>Đang hoạt động ({this.state.onlineusers.length})</h4>
                                                    <Point size={20} strokeWidth={7} color="#5fdba7" fill="#5fdba7"></Point>

                                                </div>
                                                <hr></hr>
                                                <div className="user_contain">
                                                    {
                                                        this.state.onlineusers.map(user => {
                                                            return (
                                                                <div className="uinfo">

                                                                    <img src={user.avt}></img>
                                                                    <a>{user.userName}</a>

                                                                    <Phone onClick={()=>{this.toggleCallUser(user.id)}} className="phone_icon"  size={24} strokeWidth={0.5} color="black"></Phone>

                                                                </div>

                                                            )

                                                        })
                                                    }
                                                </div>

                                            </div>

                                        </Card>
                                    </Collapse>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};
function mapStateToProps(state) {
    return {
        user: state.user,
        notification: state.notification,
        messages: state.messages
    }
}
export default connect(mapStateToProps)(withRouter(Footer));