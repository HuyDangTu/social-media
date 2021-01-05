import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import { findProfile, follow, unfollow, findTagged, findPosted, auth, updateprofile } from '../../../src/actions/user_action'
import './profile.scss';
import { GridDots, LayoutList, Edit, Settings, LayoutGrid, Tag, Dots, CircleX, Heart, Message2,Bookmark } from 'tabler-icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faBars from '@fortawesome/fontawesome-free-solid/faBars';
import faTh from '@fortawesome/fontawesome-free-solid/faTh';
import Story from '../Story/index';
import { getAllTags } from '../../actions/tag_actions';
import { Link, withRouter, useParams } from 'react-router-dom';
import { Button, withTheme, Snackbar, SnackbarMessage, Dialog } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton'
import MuiAlert from '@material-ui/lab/Alert';
class Profile extends Component {
    state = {
        setfollowerDiaglog: false,
        setfollowingDiaglog: false,
        setSnack: false,
        setDialog: false,
        setType: 'posted',
        setMessage: '',
        severity: '',
        followerslist: [],
        followings: [],
        // followers:[],
        // followings:0,
    }
    componentDidMount() {
        const userID = this.props.match.params.id
        this.props.dispatch(findProfile(userID))
        this.props.dispatch(findPosted(userID))
    }
    componentDidUpdate (prevProps) {
        if (prevProps.location.key !== this.props.location.key) {
        const userID = this.props.match.params.id
        this.props.dispatch(findProfile(userID))
        this.props.dispatch(findPosted(userID))
        this.setState({setfollowerDiaglog:false,  setType: 'posted',setfollowingDiaglog:false});

        }
    }
    handleClickunfollow = async (id) => {
        await this.props.dispatch(unfollow(id)).then(response=>
            {
                this.props.dispatch(findProfile(this.props.match.params.id))
                this.props.dispatch(auth());
            })
        await this.setState({ setSnack: true, setMessage: 'Đã bỏ theo dõi', severity: 'success' })
    }
    handleClickfollow = async (id) => {
        await this.props.dispatch(follow(id)).then(response=>{
            this.props.dispatch(findProfile(this.props.match.params.id))
            this.props.dispatch(auth());
        })
        await this.setState({ setSnack: true, setMessage: 'Đã theo dõi', severity: 'success' })
    }
    handleType = (type) => {
        if (type == 'tagged') {
            this.setState({ setType: type })
            this.props.dispatch(findTagged(this.props.user.userProfile ? this.props.user.userProfile._id : 0))
        }
        if (type == 'posted') {
            this.setState({ setType: type })
            this.props.dispatch(findPosted(this.props.user.userProfile ? this.props.user.userProfile._id : 0))
        }
        if(type=='saved'){
            this.setState({ setType: type })
        }
    }
    showDialog = () => {
        this.setState({ setDialog: true })
    }
    render() {
        const postlist = this.props.user.postlist
        const typelist = this.props.user.typelist
        const userProfile = this.props.user.userProfile
        const yourProfile = this.props.user.userData
        return (
            <Layout>
                <div className="Profile">
                <div className="shop_container">
                    <div className="shop_wrapper">
                        <div className="row">
                            <div className="col-xl-2"></div>
                            <div className="col-xl-8">
                                <div className="row pro_header">
                                    <div className="col-xl-1"></div>
                                    <div className="col-xl-3 img_contain">
                                        <div className="profile-img">
                                            {
                                                    userProfile ?
                                                    <img src={userProfile.avt}></img>:
                                                    <Skeleton variant="circle" width={160} height={160} />
                                            }
                                            
                                        </div>
                                    </div>
                                    <div className="col-xl-7 action_contain">
                                        <div className="prolile_header">
                                            <div className="name">{userProfile ? userProfile.userName : <Skeleton variant="rect" width={100} height={36} /> }</div>
                                            {
                                                 yourProfile ? (yourProfile._id == this.props.match.params.id ?
                                                    <div>
                                                    <Button className="follow_options"><Link to={`/profilesettings`}>Chỉnh sửa thông tin cá nhân</Link></Button>
                                                    <Settings size={30} strokeWidth={1} color="grey" />
                                                    </div>
                                                    :
                                                    <div>
                                                    <Button className="follow_options">Nhắn tin</Button>
                                                    {
                                                        yourProfile ? yourProfile.followings ? yourProfile.followings.includes(userProfile ? userProfile._id : 0) ?
                                                            <Button className="secondary_btn" onClick={() => this.handleClickunfollow(userProfile ? userProfile._id : 0)}> Đang Theo dõi</Button>
                                                            :
                                                            <Button className="follow_options" onClick={() => this.handleClickfollow(userProfile ? userProfile._id : 0)}>Theo dõi</Button>
                                                            : <Skeleton variant="rect" width={195} height={40} />
                                                            : <Skeleton variant="rect" width={195} height={40} />
                                                            
                                                    }
                                                    <Button onClick={this.showDialog}><Dots size={24} strokeWidth={1} color={'#7166F9'} /></Button>
                                                    </div>
                                                 ):''
                                            }
                                            
                                            <Snackbar
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'center'
                                                }}
                                                open={this.state.setSnack}
                                                onClose={() => this.setState({ setSnack: false })}
                                                autoHideDuration={1000}
                                            // message=

                                            >
                                                <MuiAlert elevation={6} variant="filled" severity={this.state.severity} message={this.state.setMessage}>{this.state.setMessage}</MuiAlert>
                                            </Snackbar>
                                            <Dialog className="dialog_wrapper" onClose={() => this.setState({ setDialog: false })} open={this.state.setDialog} >
                                                <Button> Chặn </Button>
                                                <Button> Báo cáo </Button>
                                            </Dialog>
                                            

                                        </div>
                                        <div className="profile_number">
                                            <div className="number_holder">
                                                <div className="number">{postlist ? postlist.length : <Skeleton variant="rect" width={50} height={30} />}</div>
                                                <div className="type">Bài viết</div>
                                            </div>
                                            <div className="number_holder" onClick={() => { this.setState({ setfollowerDiaglog: true }) }}>
                                                <div className="number">{userProfile ? (userProfile.followers ? userProfile.followers.length : 0) : <Skeleton variant="rect" width={50} height={30} />}</div>
                                                <div className="type">Người theo dõi</div>
                                            </div>
                                            <div className="number_holder" onClick={() => { this.setState({ setfollowingDiaglog: true }) }}>
                                                <div className="number">{userProfile ? (userProfile.followings ? userProfile.followings.length : 0) : <Skeleton variant="rect" width={50} height={30} />}</div>
                                                <div className="type" >Đang theo dõi</div>
                                            </div>
                                        </div>
                                        <div className="bio">
                                            {userProfile ? userProfile.bio : <Skeleton variant="text" />}
                                        </div>
                                    </div>
                                    <div className="col-xl-1"></div>
                                </div>
                                <div className="row no-gutters divide_type">
                                    <ul>
                                        <li>
                                            {
                                                this.state.setType == 'posted' ?
                                                    <Button className="photo_type" onClick={() => this.handleType('posted')}>
                                                        <GridDots size={20} strokeWidth={1} color="black"></GridDots>
                                                        <h2>ĐÃ ĐĂNG</h2>
                                                    </Button> :
                                                    <Button className="photo_type diselected" onClick={() => this.handleType('posted')}>
                                                        <GridDots size={20} strokeWidth={1} color="black"></GridDots>
                                                        <h2>ĐÃ ĐĂNG</h2>
                                                    </Button>

                                            }
                                        </li>
                                        <li>
                                            {
                                                this.state.setType == 'tagged' ?
                                                    <Button className="photo_type" onClick={() => this.handleType('tagged')}>
                                                        <Tag size={20} strokeWidth={1} color="black"></Tag>
                                                        <h2>ĐƯỢC GẮN THẺ</h2>
                                                    </Button>
                                                    :
                                                    <Button className="photo_type diselected" onClick={() => this.handleType('tagged')}>
                                                        <Tag size={20} strokeWidth={1} color="black"></Tag>
                                                        <h2>ĐƯỢC GẮN THẺ</h2>
                                                    </Button>
                                            }
                                        </li>
                                        {
                                             yourProfile ? (yourProfile._id == this.props.match.params.id ?
                                            <li>
                                                {
                                                    this.state.setType == 'saved' ?
                                                        <Button className="photo_type" onClick={() => this.handleType('saved')}>
                                                            <Bookmark size={20} strokeWidth={1} color="black"></Bookmark>
                                                            <h2>ĐÃ LƯU</h2>
                                                        </Button>
                                                        :
                                                        <Button className="photo_type diselected" onClick={() => this.handleType('saved')}>
                                                            <Bookmark size={20} strokeWidth={1} color="black"></Bookmark>
                                                            <h2>ĐÃ LƯU</h2>
                                                        </Button>
                                                }
                                            </li>:''):''
                                        }
                                    </ul>
                                </div>
                                <div className="row body">
                                    {
                                        typelist ? typelist.map(posts => {
                                            return (
                                                    <div className="col-xl-4 image_contain">
                                                        <div className="img_overlay">
                                                            <div className="overlay_info">
                                                                <div className="hearts">  <Heart size={24} strokeWidth={1} color="white" fill="white"></Heart><h2>{posts.likes.length}</h2> </div>
                                                                <div className="comments">  <Message2 size={24} strokeWidth={1} color="white" fill="white"></Message2><h2>{posts.comments.length} </h2></div>
                                                            </div>
                                                        </div>
                                                        <img src={posts.images[0].url}></img>
                                                    </div>
                                            )
                                        }) : <Skeleton variant="rect" width={1043} height={315} />
                                    }

                                </div>
                            </div>
                            <div className="col-xl-2"></div>
                        </div>

                    </div>
                </div>
                </div>
                <Dialog className="dialog_cont"  onClose={() => {this.setState({ setfollowerDiaglog: false }); this.props.dispatch(findProfile(this.props.match.params.id))}} open={this.state.setfollowerDiaglog} >
                    <div className="header">
                        <h5>Danh sách theo dõi</h5>
                        <CircleX size={24} strokeWidth={0.5} color="black"></CircleX>
                    </div>
                    {
                        userProfile ? (userProfile.followers ? userProfile.followers.map(follower => {
                            return (
                                <div className="follow_list">
                                    <div className="list_info">
                                        <img src={follower.avt}></img>        
                                        <Link to={`/user/${follower._id}`}> <h2>{follower.userName}</h2></Link>
                                    </div>
                                    {
                                        yourProfile ? (yourProfile._id == follower._id ? <Button className="minibtn"> Trang cá nhân</Button>
                                            :
                                            yourProfile ? yourProfile.followings.includes(follower._id) ?
                                                <Button className="minibtn" onClick={() => this.handleClickunfollow(follower._id)} > Đang theo dõi</Button>
                                                :
                                                <Button className="minibtn" onClick={() => this.handleClickfollow(follower._id)}>Theo dõi</Button>
                                                : null)
                                            : null
                                    }

                                </div>

                            )
                        }) : '') : ''
                    }
                </Dialog>
                <Dialog className="dialog_cont"  onClose={() => {this.setState({ setfollowingDiaglog: false }); this.props.dispatch(findProfile(this.props.match.params.id))}} open={this.state.setfollowingDiaglog} >
                    <div className="header">
                        <h5>Danh sách đang theo dõi</h5>
                        <CircleX size={24} strokeWidth={0.5} color="black"></CircleX>
                    </div>
                    {
                        userProfile ? (userProfile.followings ? userProfile.followings.map(following => {
                            return (
                                <div className="follow_list">
                                    <div className="list_info">
                                        <img src={following.avt}></img>
                                        <Link to={`/user/${following._id}`}> <h2>{following.userName}</h2></Link>
                                    </div>
                                    {
                                        yourProfile ? (yourProfile._id == following._id ? <Button className="minibtn"> Trang cá nhân</Button>
                                            :
                                            yourProfile ? yourProfile.followings.includes(following._id) ?
                                                <Button className="minibtn" onClick={() => this.handleClickunfollow(following._id)} > Đang theo dõi</Button>
                                                :
                                                <Button className="minibtn" onClick={() => this.handleClickfollow(following._id)}>Theo dõi</Button>
                                                : null)
                                            : null
                                    }

                                </div>

                            )
                        }) : '') : ''
                    }
                </Dialog>
            </Layout>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        user: state.user,
    }
}
export default connect(mapStateToProps)(withRouter(Profile));