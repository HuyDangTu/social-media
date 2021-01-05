import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import { findProfile,findTagged,findPosted,unfollow,follow  } from '../../../src/actions/user_action'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import './profile.scss';
import { GridDots, LayoutList, Edit, Settings, LayoutGrid, Tag, Dots, Bookmark,CircleX } from 'tabler-icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faBars from '@fortawesome/fontawesome-free-solid/faBars';
import faTh from '@fortawesome/fontawesome-free-solid/faTh';
import Story from '../Story/index';
import { getAllTags } from '../../actions/tag_actions';
import { Link, withRouter, useParams } from 'react-router-dom';
import { withTheme } from '@material-ui/core';
import { set } from 'mongoose';
import { ISO_8601 } from 'moment';

// const Transition = React.forwardRef(function Transition(props, ref) {
//     return <Slide direction="up" ref={ref} {...props} />;
//   });
// export default function AlertDialogSlide() {
//     const [open, setOpen] = React.useState(false);

//     const handleClickOpen = () => {
//       setOpen(true);
//     };

//     const handleClose = () => {
//       setOpen(false);
//     };}
class UserProfile extends Component {

    state = {
        setType: 'posted',
        setfollowerDiaglog: false,
        setfollowingDiaglog: false,
    }
    componentDidMount() {

        this.props.dispatch(findProfile(this.props.user.userData._id))
        this.props.dispatch(findPosted(this.props.user.userData._id))
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
    handleClickunfollow = async (id) => {
        await this.props.dispatch(unfollow(id))
     //   await this.props.dispatch(findProfile(this.props.user.userData._id))
        this.setState({ setSnack: true, setMessage: 'Đã bỏ theo dõi', severity: 'success' })
    }
    handleClickfollow = async (id) => {
        await this.props.dispatch(follow(id))
   //     await this.props.dispatch(findProfile(this.props.user.userData._id))
        this.setState({ setSnack: true, setMessage: 'Đã theo dõi', severity: 'success' })
    }
    render() {
        const postlist = this.props.user.postlist
        const typelist = this.props.user.typelist
        const userProfile = this.props.user.userProfile
        const yourProfile = this.props.user.userData
        console.log(userProfile)
        //const userProfile = this.props.user.userProfile
        return (
            <Layout>
                <div className="shop_container">
                    <div className="shop_wrapper">
                        <div className="row">
                            <div className="col-xl-2"></div>
                            <div className="col-xl-8">
                                <div className="row pro_header">
                                    <div className="col-xl-4 img_contain">
                                        <div className="profile-img">

                                            <img src={this.props.user.userData.avt}></img>

                                        </div>
                                    </div>
                                    <div className="col-xl-7 action_contain">
                                        <div className="prolile_header">
                                            <div className="name">{this.props.user.userData.userName}</div>
                                            <Button className="follow_options"><Link to={`/profilesettings`}>Chỉnh sửa thông tin cá nhân</Link></Button>
                                            <Button> <Settings size={30} strokeWidth={1} color="grey" /></Button>
                                        </div>
                                        <div className="profile_number">
                                            <div className="number_holder">
                                                <div className="number">{postlist ? postlist.length : 0}</div>
                                                <div className="type">Bài viết</div>
                                            </div>
                                            <div className="number_holder" onClick={()=>{this.setState({setfollowerDiaglog:true})}}>
                                                <div className="number">{this.props.user.userData.followers.length}</div>
                                                <div className="type">Người theo dõi</div>
                                            </div>
                                            <div className="number_holder" onClick={()=>{this.setState({setfollowingDiaglog:true})}}>
                                                <div className="number">{this.props.user.userData.followings.length}</div>
                                                <div className="type">Đang theo dõi</div>
                                            </div>
                                        </div>
                                        <div className="bio">
                                            {this.props.user.userData.bio}
                                        </div>
                                    </div>
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
                                        </li>
                                    </ul>
                                </div>
                                {
                                    typelist ? typelist.map(posts => {
                                        return (
                                            <div>
                                                <div className="row body">

                                                    <div className="col-xl-4 image_contain">
                                                        <img src={posts.images[0].url}></img>
                                                    </div>
                                                    <div className="col-xl-4 image_contain">

                                                        <img src={posts.images[0].url}></img>
                                                    </div><div className="col-xl-4 image_contain">

                                                        <img src={posts.images[0].url}></img>
                                                    </div>

                                                </div>
                                                <div className="row body">

                                                    <div className="col-xl-4 image_contain">
                                                        <img src={posts.images[0].url}></img>
                                                    </div>
                                                    <div className="col-xl-4 image_contain">

                                                        <img src={posts.images[0].url}></img>
                                                    </div><div className="col-xl-4 image_contain">

                                                        <img src={posts.images[0].url}></img>
                                                    </div>

                                                </div>
                                            </div>

                                        )
                                    }) : ''
                                }


                            </div>
                            

                        </div>
                        <div className="col-xl-2"></div>
                    </div>

                </div>
                <Dialog className="dialog_cont" onClose={() => {this.setState({ setfollowerDiaglog: false });this.props.dispatch(findProfile(this.props.user.userData._id))}} open={this.state.setfollowerDiaglog} >
                    <div className="header">
                        <h5>Danh sách theo dõi</h5>
               <CircleX size={24} strokeWidth={0.5} color="black"></CircleX>
                    </div>
                {
                    userProfile ? (userProfile.followers? userProfile.followers.map(follower=>{
                        return(
                            <div className="follow_list">
                                <div className="list_info">
                                <img src={follower.avt}></img>
                                <h2>{follower.userName}</h2>
                                </div>
                                {
                                    yourProfile? (yourProfile._id == follower._id ?  <Button className="minibtn"> Trang cá nhân</Button>
                                    :
                                    yourProfile? yourProfile.followings.includes(follower._id)?
                                    <Button className="minibtn" onClick={()=>this.handleClickunfollow(follower._id)} > Đang theo dõi</Button> 
                                    :
                                    <Button className="minibtn" onClick={()=>this.handleClickfollow(follower._id)}>Theo dõi</Button>
                                    :null)
                                    :null
                                }
                               
                            </div>
                                       
                        )
                    }):''):''
                }
                </Dialog>
                <Dialog className="dialog_cont" onClose={() => {this.setState({ setfollowingDiaglog: false }); this.props.dispatch(findProfile(this.props.user.userData._id))}} open={this.state.setfollowingDiaglog} >
                    <div className="header">
                        <h5>Danh sách đang theo dõi</h5>
               <CircleX size={24} strokeWidth={0.5} color="black"></CircleX>
                    </div>
                {
                    userProfile ? (userProfile.followings? userProfile.followings.map(following=>{
                        return(
                            <div className="follow_list">
                                <div className="list_info">
                                <img src={following.avt}></img>
                                <h2>{following.userName}</h2>
                                </div>
                                {
                                    yourProfile? (yourProfile._id == following._id ?  <Button className="minibtn"> Trang cá nhân</Button>
                                    :
                                    yourProfile? yourProfile.followings.includes(following._id)?
                                    <Button className="minibtn" onClick={()=>this.handleClickunfollow(following._id)} > Đang theo dõi</Button>
                                    :
                                    <Button className="minibtn" onClick={()=>this.handleClickfollow(following._id)}>Theo dõi</Button>
                                    :null)
                                    :null
                                }
                               
                            </div>
                                       
                        )
                    }):''):''
                }
                </Dialog>
            </Layout >
        )
    }
}


const mapStateToProps = (state) => {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps)(withRouter(UserProfile));