import React, { Component } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import { findProfile, follow, unfollow, findTagged, findPosted, findSaved ,auth, blockUser,requestfollow,undorequestfollow } from '../../../src/actions/user_action'
import {findPersonal} from '../../../src/actions/message_action'
import {getHighLightStory,getAllStories,createHighLightStory} from '../../actions/user_action';
import './profile.scss';
import { GridDots, Tag, Dots, CircleX, Heart, Message2,Bookmark } from 'tabler-icons-react'
import HighLightStory from './HighLightStory';
import StoryDisplay from './StoryDisplay';
import { Button, withTheme, Snackbar, SnackbarMessage, Dialog } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton'
import MuiAlert from '@material-ui/lab/Alert';
import { Link, withRouter } from 'react-router-dom';
import FormField from '../ultils/Form/FormField';
import { populateOptionFields, update, ifFormValid, generateData, resetFields } from '../ultils/Form/FormActions';
import Slide from '@material-ui/core/Slide';
import Report from '../Report/Report';
import PostRow from './post';
import { getPolicy } from '../../actions/policy_actions';
import moment from 'moment';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

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

        storyDialog: false,
        storyIndex: -1,
        storyUploading: false,

        createHighlightStoryDiaglog: false,
        highLightStory: [],
        
        formSuccess: false,
        formMessage: "",
        formData: {
            name: {
                element: 'input',
                value: '',
                config: {
                    placeholder: 'Tên',
                    label: 'Tên',
                    name: 'name',
                    options: [],
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: false
            },
        },

        setSnack: false,
        addStorySuccess: false,

        reportStatus: false,
        reportSuccess: false,
        SnackMess: "",

        isReportFormShow: false,
        reportData: {},

        setfollowerDiaglog: false,
        alertFunctionIsRestricted: false,

        restrictedFunction: {}
    }
    
    componentDidMount() {
        const userID = this.props.match.params.id
        this.props.dispatch(findProfile(userID)).then((response)=>{
            console.log(response)
            if(response.payload.NotFound){
                this.props.history.push('/notfound');
            }
        });
        this.props.dispatch(findPosted(userID))
        this.props.dispatch(getHighLightStory(userID))
        this.props.dispatch(getAllStories());
        this.props.dispatch(getPolicy());
    }

    showReportForm(type){
        return <Report 
            isReportFormShow={this.state.isReportFormShow}
            reportData = {this.state.reportData}
            handleSnackBar={(mess,res) => { this.handleSnackBar(mess,res) }}
            list={this.props.policies.policyList}
            closeReportForm = {()=>this.closeReportForm()}
        />
    }

    handleSnackBar = (mess,res) => {
        console.log(mess,res);
        this.setState({ reportStatus: true, SnackMess: mess, reportSuccess: res})
    }

    closeReportForm = () =>{
        this.setState({
            isReportFormShow: false,
            reportData: {},
        }) 
    }

    componentDidUpdate (prevProps) {
        if (prevProps.location.key !== this.props.location.key) {
            const userID = this.props.match.params.id
            console.log(userID)
            this.props.dispatch(findProfile(userID)).then((response)=>{
                console.log(response)
                
                if(response.payload.NotFound){
                    this.props.history.push('/notfound');
                }
            });
            this.props.dispatch(findPosted(userID))
            this.props.dispatch(getHighLightStory(userID));
      
            this.setState({setfollowerDiaglog:false,  setType: 'posted',setfollowingDiaglog:false});
        }
    }
    handleClickfollow = async (id) => {
        if(this.props.user.userProfile?this.props.user.userProfile.privateMode===true:'')
        {
            await this.props.dispatch(requestfollow(id)).then(response=>{
                this.setState({ setSnack: true, setMessage: 'Đã theo dõi', severity: 'success' })
            })
        }
        else{
            await this.props.dispatch(follow(id)).then(response=>{
                if(response.payload.restricted){
                    console.log(response.payload);
                    this.setState({alertFunctionIsRestricted: true, restrictedFunction: response.payload.restrictedFunction})
                }else{
                    this.props.dispatch(findProfile(this.props.match.params.id))
                    this.props.dispatch(auth());
                    this.setState({ setSnack: true, setMessage: 'Đã theo dõi', severity: 'success' })
                }
            })
        }
    
    }
    
    handleClickunfollow = async (id) => {
        if(this.props.user.userProfile?this.props.user.userProfile.request.includes(this.props.user.userData?this.props.user.userData._id:''):''){
            await this.props.dispatch(undorequestfollow(id)).then(response=>{
                this.setState({ setSnack: true, setMessage: 'Đã hủy yêu cầu theo dõi', severity: 'warning' })
            })
        }
        else{
            await this.props.dispatch(unfollow(id)).then(response=>
                {
                    if(response.payload.restricted){
                        console.log(response.payload);
                        this.setState({alertFunctionIsRestricted: true, restrictedFunction: response.payload.restrictedFunction})
                    }else{
                        this.props.dispatch(findProfile(this.props.match.params.id))
                        this.props.dispatch(auth());
                        this.setState({ setSnack: true, setMessage: 'Đã bỏ theo dõi', severity: 'success' })
                    }
                })
        }  
    }

    setDisplayIndex = (index) => {
        this.setState({
            currentDisplay: index,
            isStoryPageShow: true,
        })
    }

    openCreateHighlightStoryDiaglog = () =>{
        this.setState({createHighlightStoryDiaglog: true})
    }

    openEditor = () => {
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
            this.props.dispatch(findSaved(this.props.user.userProfile ? this.props.user.userProfile._id : 0))
        }
    }

    showDialog = () => {
        this.setState({ setDialog: true })
    }

    countNumberOfPost = () => {
        const postlist = this.props.user.postlist;
        let cnt = 0;
        postlist.forEach(item => {
            if(item.hidden==false) cnt+=1;
        })
        return cnt;
    }

    displayStory = () =>{
        this.setState({
            storyDialog: true,
        })
    }

    setIndex = (index) =>{
        this.setState({
            storyIndex: index,
        })
    }
    
    openDialog = () =>{
        this.setState({ storyDialog: true })
    }

    pullStory(item){
        let newhighLightStory = [...this.state.highLightStory]
        newhighLightStory.splice(this.state.highLightStory.indexOf(item), 1);
        console.log(newhighLightStory);
        this.setState({ highLightStory: newhighLightStory })
    }

    pushStory(item){
        let newhighLightStory = [...this.state.highLightStory]
        newhighLightStory.push(item);
        console.log(newhighLightStory);
        this.setState({ highLightStory: newhighLightStory })
    }

    updateForm = (element) => {
        const newFormdata = update(element, this.state.formData, 'story_name');
        if(newFormdata.name.value.trim() != ""){
            this.setState({
                formSuccess: true,
                formData: newFormdata
            });
        }else{
            this.setState({
                formSuccess: false,
                formData: newFormdata
            });
        }
    }

    render() {
        const postlist = this.props.user.postlist
        const typelist = this.props.user.typelist
        const userProfile = this.props.user.userProfile
        const yourProfile = this.props.user.userData
        const storyList = this.props.user.storyList
        
        return (
            <Layout>
                <div className="Profile">
                <div className="profile_container">
                    <div className="profile_wrapper">
                        <div className="row pro_header">
                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-sm-3 col-3 ">
                                <div className="profile-img">
                                    {
                                        userProfile ?
                                        <img src={userProfile.avt}></img>:
                                        <Skeleton variant="circle" width={160} height={160} />
                                    }
                                </div>
                            </div>
                            <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-sm-1 col-1"></div>
                            <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-sm-8 col-8 action_contain">
                                <div className="prolile_header">
                                    <div className="name">{userProfile ? userProfile.userName : <Skeleton variant="rect" width={100} height={36} /> }</div>
                                    {
                                        yourProfile ? (yourProfile._id == this.props.match.params.id ?
                                            <div>
                                            <Button className="follow_options"><Link to={`/profilesettings`}>Chỉnh sửa thông tin cá nhân</Link></Button>
                                            </div>
                                        :
                                            <div>
                                                 <Button className="follow_options" onClick={async()=>{await this.props.dispatch(findPersonal(this.props.match.params.id)); await this.props.history.push(`/message/inbox/${this.props.messages.conversationinfo._id}`) }}>Nhắn tin</Button>
                                                {
                                                    
                                                        userProfile?userProfile.request.includes(yourProfile._id)?
                                                        <Button className="follow_options" onClick={() => this.handleClickunfollow(userProfile ? userProfile._id : 0)}>Đã gửi yêu cầu</Button>
                                                        :
                                                        yourProfile ? yourProfile.followings ? yourProfile.followings.includes(userProfile ? userProfile._id : 0) ?
                                                        <Button className="secondary_btn" onClick={() => this.handleClickunfollow(userProfile ? userProfile._id : 0)}>Đang Theo dõi</Button>
                                                        :
                                                        <Button className="follow_options" onClick={() => this.handleClickfollow(userProfile ? userProfile._id : 0)}>Theo dõi</Button>
                                                        : <Skeleton variant="rect" width={195} height={40} />
                                                        : <Skeleton variant="rect" width={195} height={40} />
                                                        :<Skeleton variant="rect" width={195} height={40} />
                                                        
                                                }
                                                <Button onClick={this.showDialog}><Dots size={24} strokeWidth={1} color={'#7166F9'}/></Button>
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
                                    >
                                    <MuiAlert elevation={6} variant="filled" severity={this.state.severity} message={this.state.setMessage}>{this.state.setMessage}</MuiAlert>
                                    </Snackbar>
                                    <Dialog className="dialog_wrapper" onClose={() => this.setState({ setDialog: false })} open={this.state.setDialog} >
                                        <Button onClick={()=>{
                                            this.props.dispatch(blockUser(userProfile._id)).then(response =>{
                                                if(response.payload.success){
                                                    this.props.history.push("/newfeed");
                                                }else{
                                                    console.log("failllllllllllllll");
                                                }
                                            })
                                        }}> Chặn </Button>
                                        <Button onClick={()=>{this.setState({isReportFormShow: true,
                                                setDialog: false, 
                                                reportData: {
                                                    reportType: "user",
                                                    userId: this.props.match.params.id,
                                                }
                                            })}}> Báo cáo </Button>
                                    </Dialog>
                                </div>
                                <div className="profile_number">
                                    <div className="number_holder">
                                        <div className="number">{postlist ? this.countNumberOfPost() : <Skeleton variant="rect" width={50} height={30} />}</div>
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
                        </div>
                        <div className="row highlight-story">
                            <HighLightStory 
                                open={this.openEditor}
                                list={this.props.user.highlightStory}
                                storyList={this.props.user.storylist}
                                setIndex={(index)=>{this.setIndex(index)}}
                                openDialog={this.openDialog}
                                openCreateHighlightStoryDiaglog={this.openCreateHighlightStoryDiaglog}
                                createButton={ yourProfile._id == this.props.match.params.id ? true : false}
                            />
                            { 
                                this.props.user.highlightStory ?
                                <Dialog 
                                    className="story-display-wrapper" 
                                    onClose={() => this.setState({ storyDialog: false })} 
                                    open={this.state.storyDialog} 
                                >
                                    <StoryDisplay story={this.props.user.highlightStory[this.state.storyIndex]}/>
                                </Dialog>                                  
                                : this.state.storyIndex 
                            }
                        </div>
                        <div className="row divide_type">
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
                        {
                        yourProfile ? yourProfile._id !== this.props.match.params.id ? this.props.user.userProfile?this.props.user.userProfile.privateMode===true ? yourProfile.followings.includes(this.props.match.params.id)===false?
                        <div className="row body">
                            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 image_contain"></div>
                            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 image_contain">
                            <h6>Tài khoản riêng tư theo dõi để thấy bài viết</h6>
                            </div>
                            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 image_contain"></div>
                          
                        </div>
                        :
                        <PostRow typelist={typelist}></PostRow>
                        :
                        <PostRow typelist={typelist}></PostRow>
                        :
                        <PostRow typelist={typelist}></PostRow>
                        :
                        <PostRow typelist={typelist}></PostRow>
                        :
                        <PostRow typelist={typelist}></PostRow>
                        }
                    </div>
                </div>
                </div>
                <Dialog className="dialog_cont"  onClose={() => {this.setState({ setfollowerDiaglog: false }); this.props.dispatch(findProfile(this.props.match.params.id))}} open={this.state.setfollowerDiaglog} >
                    <div className="dialog_header">
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
                    <div className="dialog_header">
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
                {/* Thêm story */}
                {
                    this.props.user.storylist?
                        <Dialog
                            fullWidth={true}
                            maxWidth="lg"  
                            className="createHighLightStoryForm"  
                            onClose={() => {this.setState({ createHighlightStoryDiaglog: false })}} 
                            open={this.state.createHighlightStoryDiaglog}
                        >
                        <div className="wrapper">
                            <div className="row no-gutters">
                                <div className="col-lg-3 no-gutters">
                                    <div className="row no-gutters form-header">
                                    <h5>Tin nổi bật</h5>
                                    
                                    <FormField
                                        id={'name'}
                                        formData={this.state.formData.name}
                                        change={(element) => this.updateForm(element)}
                                    />
                                    <div className="header-feature">
                                        <button className="btn btn-cancel">Hủy</button>
                                        <button className="btn" 
                                            onClick={()=>{
                                                //console.log(this.state.formSuccess,this.state.highLightStory)
                                                if(this.state.formSuccess && this.state.highLightStory.length != 0)
                                                {
                                                    let dataToSubmit = {
                                                        name: this.state.formData.name.value,
                                                        storyList: [...this.state.highLightStory]
                                                    }
                                                    console.log("dô",dataToSubmit);
                                                    this.props.dispatch(createHighLightStory(dataToSubmit)).then(response=>{
                                                        if(response.payload.success){
                                                            this.setState({addStorySuccess: true,formMessage:"Thêm thành công",createHighlightStoryDiaglog: false,setSnack: true, })
                                                        }else{
                                                            this.setState({addStorySuccess: false,formMessage:"Lỗi! Vui lòng thử lại :(",setSnack: true})
                                                        }
                                                    })
                                                }else{
                                                    console.log(this.state.formError,this.state.highlightStory)
                                                    this.setState({addStorySuccess: false,formMessage:"Vui lòng kiểm tra thông lại thông tin :(",setSnack: true})
                                                }
                                        }}>Thêm mới</button>      
                                    </div>
                                </div>
                                </div>
                                <div className="col-lg-9 no-gutters">
                                    <div className="row no-gutters form-content">
                                    {
                                        this.props.user.storylist.map((item,index)=>{
                                            return <div 
                                            onClick={()=>{
                                                this.state.highLightStory.includes(item._id) ?
                                                    this.pullStory(item._id) : this.pushStory(item._id)
                                            }} 
                                            className={`col-lg-3 no-gutters image-wrapper` }>
                                                <img className={`story-item ${this.state.highLightStory.includes(item._id) ? "story_selected":"unselected_story"}`} 
                                                    src={item.image.url}/>
                                            </div>
                                        })
                                    }
                                </div>
                                </div>
                            </div>
                        </div> 
                    </Dialog>
                    :"loading"
                }
                {/* Thông báo chỉnh sửa story nổi bật thành công */}
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    open={this.state.setSnack}
                    onClose={() => this.setState({ setSnack: false })}
                    autoHideDuration={1000}
                >
                    <MuiAlert elevation={6} variant="filled" severity={`${this.state.addStorySuccess?"success":"warning"}`} >{this.state.formMessage}</MuiAlert>
                </Snackbar>
                {/* Thông báo báo cáo tài khoản thành công */}
               <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    open={this.state.reportStatus}
                    onClose={() => this.setState({ reportStatus: false })}
                    autoHideDuration={3000}>
                    <MuiAlert elevation={6} variant="filled" severity={this.state.reportSuccess?"success":"warning"} >{this.state.SnackMess}</MuiAlert>
                </Snackbar>
                {
                    this.showReportForm()
                }
                <Dialog className="dialog_cont" 
                    onClose={() => { this.setState({ alertFunctionIsRestricted: false })}} 
                    open={this.state.alertFunctionIsRestricted} >
                    <div className="dialog_header">
                        <h5>Bạn đã bị hạn chế chức năng này cho đến {moment(this.state.restrictedFunction.amountOfTime).format("L")}</h5>
                    </div>
                </Dialog>
            </Layout>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        products: state.products,
        policies: state.policies,
        messages: state.messages
    }
}
export default connect(mapStateToProps)(withRouter(Profile));