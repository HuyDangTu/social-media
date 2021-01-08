import React, { Component } from 'react';
import './header.scss'
import { Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {logoutUser} from '../../../actions/user_action'
import NativeClickListener from '../../ultils/NativeClickListener';
import { getConversation } from '../../../actions/message_action'
import { getNotification, seenNotification, seenAllNotification } from '../../../actions/notification_action'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Send, Notification, BrandSafari, User, Settings, Point } from 'tabler-icons-react'
import faUser from '@fortawesome/fontawesome-free-solid/faUser';
import faCog from '@fortawesome/fontawesome-free-solid/faCog';
import Search from '../../Search';
import Skeleton from '@material-ui/lab/Skeleton'
import Pusher from 'pusher-js';
import Badge from '@material-ui/core/Badge';
import Snackbar from '@material-ui/core/Snackbar';
class Header extends Component {
    
    state = {
        user:[
            {
                name: 'Explore',
                linkTo: '/',
            },
            {
                name:'Direct',
                linkTo: '/users/direct',
            },
            {
                name: 'Notification',
                linkTo: '/users/Notification',
            },
            {
                name: 'avt'
            },
            {
                name: 'Log in',
                linkTo: '/register_login',
            },
        ],
        dropdown: false,
        notifydropdown: false,
        setSnack: false,
        notifycontent: '',
        notifylink: '',
        notifyimg: '',
    }

    logoutHandler = () =>{
        this.props.dispatch(logoutUser())
        .then(response => {
            if(response.payload.success){
                this.props.history.push('/')
            }
        })
    }
    
    // handleDropdown = () => {
    //     console.log(!this.state.dropdown)
    //     this.setState({
    //         dropdown: !this.state.dropdown
    //     })
    // }

    handleSeenall = () => {
        this.props.dispatch(seenAllNotification());
        this.props.dispatch(getNotification())
    }

    defaultLink = (item,i) =>{
        if(item.name === 'Log out'){
            return(
            <div>
                <Link to={item.linkTo} key={i}
                onClick={this.logoutHandler}>{item.name}</Link>
            </div>)
        } else if (item.name === 'avt') {
            return (
                <div className="menu">
                    {
                    this.props.user.userData.avt ?
                        <img onClick={this.toggleDropdown} className="avt" alt="photo" src={this.props.user.userData.avt} />
                            : <Skeleton variant="circle" width={40} height={40} />
                    }
                    {
                    this.state.dropdown ?
                    <NativeClickListener onClick={()=>this.setState({dropdown: false})}>
                    <div className="dropdown" onClick={this.handleBodyClick}>
                        <div className="user_navigation">
                            <div>
                                <FontAwesomeIcon icon={faUser}/>
                                <Link to={`/user/${this.props.user.userData._id}`}>Profile</Link>
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faCog}/>
                                <Link to={`/user/setting/${this.props.user.userData._id}`}>Setting</Link>
                            </div>
                        </div>
                        <div className="logout">
                            <Link key={i} onClick={this.logoutHandler}>Log out</Link>
                        </div>
                    </div>
                    </NativeClickListener>
                    : null
                    }          
                </div>
            )
        }else if (item.name === 'Explore'){
            return (
                <div>
                    <BrandSafari size={30} color="grey" strokeWidth={1} />
                </div>)
        } else if (item.name === 'Notification') {
            var notinumber = 0;
            return (
                <div className="notify">
                    <div>

                    {/* <div className="number_content">
                    <div className="number"> */}
                        {
                            this.props.notification ? this.props.notification.notifylist ? this.props.notification.notifylist.forEach(
                                (item) => {
                                    console.log(item.seenStatus)
                                    if (!item.seenStatus) {
                                        notinumber = notinumber + 1;
                                    }
                                }
                            ) : '' : ''
                        }
                        <Badge badgeContent={notinumber} overlap="circle" color="secondary">
                            <Notification onClick={this.toggleNofifyDropdown} size={34} color="grey" strokeWidth={1} />
                        </Badge>

                    </div>


                    {/* {    
                              this.props.notification?  this.props.notification.notifylist?   this.props.notification.notifylist.map(data =>{
                                    return(
                                        <div>
                                        {    
                                            (data.seenStatus==false)?notinumber++:''
                                            
                                        }
                                        {notinumber}
                                        </div>
                                    )
                              }):'':''} */}

                    {/* </div>
                </div> */}
                    {
                        this.state.notifydropdown ?
                            <NativeClickListener onClick={() => this.setState({ notifydropdown: false })}>
                                <div className="notifydropdown" onClick={this.handleBodyClick}>
                                    <div className="notifyheader" > <h2>Thông báo</h2> <h6 onClick={this.handleSeenall}>Đánh dấu tất cả đã đọc</h6></div>
                                    {
                                        this.props.notification ? this.props.notification.notifylist ? this.props.notification.notifylist.map(data => {
                                            return (
                                                data.seenStatus ?
                                                    <div className="noti_wrapper seen" onClick={() => this.handleNotiClick(data._id, data.type, data.link)}>
                                                        <div className="user_avt">
                                                            <img src={data.sentFrom.avt}></img>
                                                        </div>
                                                        <div className="content">
                                                            <p>
                                                                <h6>{data.sentFrom.userName}</h6>
                                                                {
                                                                    data.type == "follow" ? ' đã theo dõi bạn' : data.type == "likepost" ? ' đã thích bài viết của bạn' : ''
                                                                }
                                                            </p>
                                                            <h6>
                                                                6 giờ trước
                                            </h6>
                                                        </div>
                                                        <div className="status">
                                                            <Point visibility="hidden" size={24} strokeWidth={5} color="#7166F9" fill="#7166F9"></Point>
                                                        </div>
                                                    </div> :
                                                    <div className="noti_wrapper" onClick={() => this.handleNotiClick(data._id, data.type, data.link)}>
                                                        <div className="user_avt">
                                                            <img src={data.sentFrom.avt}></img>
                                                        </div>
                                                        <div className="content">
                                                            <p>
                                                                <h6>{data.sentFrom.userName}</h6>
                                                                {
                                                                    data.type == "follow" ? ' đã theo dõi bạn' : data.type == "likepost" ? ' đã thích bài viết của bạn' : ''
                                                                }
                                                            </p>
                                                            <h6>
                                                                6 giờ trước
                                             </h6>

                                                        </div>

                                                        <div className="status">
                                                            <Point size={24} strokeWidth={5} color="#7166F9" fill="#7166F9"></Point>
                                                        </div>
                                                    </div>
                                            )
                                        }) : '' : ''
                                    }
                                </div>
                            </NativeClickListener>
                            : null
                    }
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                        }}
                        open={this.state.setSnack}
                        onClose={() => this.setState({ setSnack: false })}
                        autoHideDuration={10000}
                        direction="up"
                    >
                        {
                            this.props.notification ? this.props.notification.notifylist ? this.props.notification.notifylist[0] ?
                                <div className="snack_noti">
                                    <div className="noti_wrapper" onClick={() => this.handleNotiClick(this.props.notification.notifylist[0]._id, this.props.notification.notifylist[0].type, this.props.notification.notifylist[0].link)}>
                                        <div className="user_avt">
                                            <img src={this.props.notification.notifylist[0].sentFrom.avt}></img>
                                        </div>
                                        <div className="content">
                                            <p>
                                                <h6>{this.props.notification.notifylist[0].sentFrom.userName}</h6>
                                                {
                                                    this.props.notification.notifylist[0].type == "follow" ? ' đã theo dõi bạn nè m shak sssh' : this.props.notification.notifylist[0].type == "likepost" ? ' đã thích bài viết của bạn' : ''
                                                }
                                            </p>
                                            <h6>
                                                6 giờ trước
                                                      </h6>
                                        </div>
                                        <div className="status">
                                            <Point visibility="hidden" size={24} strokeWidth={5} color="#7166F9" fill="#7166F9"></Point>
                                        </div>
                                    </div>
                                </div>
                                : '' : '' : ''
                        }
                    </Snackbar>
                </div>

            )
        } else if (item.name === 'Direct') {
            var messnumber = 0;
            return (
                <div>
                    {
                        this.props.messages ? this.props.messages.conlist ? this.props.messages.conlist.forEach(
                            (con) => {
                                console.log(con.seenBy)
                                if (con.seenBy.includes(this.props.user.userData._id) == false) {
                                    messnumber = messnumber + 1;
                                }
                            }
                        ) : '' : ''
                    }
                    <Badge badgeContent={messnumber} overlap="circle" color="secondary">
                        <Link to="/message/inbox"><Send size={30} color="grey" strokeWidth={1} /></Link>
                    </Badge>

                </div>)
        }else{
            return <div>
                <Link to={item.linkTo} key={i}></Link>
            </div>
        }
    }

    componentDidMount = () => {
        this.props.dispatch(getConversation())
        console.log(this.props.messages ? this.props.messages.conlist : '')
        this.props.dispatch(getNotification())
        console.log(this.props.notification?  this.props.notification.notifylist:'')
        const pusher = new Pusher('c0e96b0fff8d0edac17d', {
            cluster: 'mt1'
        });
        const channel = pusher.subscribe('notifications');
        channel.bind('newNoti', data => {
            if (data.change.operationType == "insert") {
                if (data.change.fullDocument.sentTo == this.props.user.userData._id) {
                    this.props.dispatch(getNotification())
                    this.setState({ setSnack: true })
                }
            }
        });
        const channel2 = pusher.subscribe('messages');
        channel2.bind('newMessage', data => {
            if (data.change.fullDocument.sentTo == this.props.user.userData._id || data.change.fullDocument.sentBy == this.props.user.userData._id) {
                this.props.dispatch(getConversation())
            }
        });
    }


    toggleDropdown = (syntheticEvent) => {
        console.log('toggle dropdown')
        this.setState(prevState => ({ dropdown: !prevState.dropdown }))
    }

    handleBodyClick = (syntheticEvent) => {
        console.log('body click')
    }

    toggleNofifyDropdown = (syntheticEvent) => {
        console.log('toggle dropdown')
        this.setState(prevState => ({ notifydropdown: !prevState.notifydropdown }))
        this.props.dispatch(getNotification());
        console.log(this.props.notification)
    }

    handleNotiClick = (id, type, link) => {
        this.props.dispatch(seenNotification(id))
        console.log('Đã xem thông báo', id)
        if (type == 'follow') {
            this.props.history.push(`/user/${link}`)
        }
        this.props.dispatch(getNotification())
    }

    showLinks = (type) =>{
        let list = [];

        if(this.props.user.userData){
            type.forEach((item)=>{
                if(!this.props.user.userData.isAuth){
                    if (item.name === 'Log in') {
                        list.push(item)
                    } 
                }else{
                    if(item.name !== 'Log in'){
                        list.push(item)
                    }
                }
            })
        }

        return list.map((item,i) => {
            return this.defaultLink(item,i)
        })
    }

    render() {
        return (
            <header className="header">    
                <div className="header__container container-fluid"> 
                    <div className="row no-gutters">
                        <div className="col-xl-4 no-gutters">
                            <div className="header__logo" onClick={()=>{this.props.history.push('/newfeed')}}>
                                <img src={require('../../../asset/logo/logo2x.png')} />
                                <img class="Logo_stunn" src={require('../../../asset/logo/stunn2x.png')} />
                            </div>
                        </div>
                        <div className="col-xl-4 no-gutters">
                            <div className="header__nav-page">
                                <Search />
                            </div>
                        </div>
                        <div className="col-xl-4 no-gutters">
                            <div className="header__nav-user">
                                {this.showLinks(this.state.user)}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}
function mapStateToProps(state){
    return{
        user: state.user,
        notification: state.notification,
        messages: state.messages
    }
}
export default connect(mapStateToProps)(withRouter(Header));