import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../Layout/index';
import { withRouter } from 'react-router-dom';
import { getReportDetail, updateReport, deletePost, clearDetail, deleteComment, restrictUser, deleteRestrictedFunction } from '../../../actions/report_actions';
import CircularProgress from '@material-ui/core/CircularProgress';
import './ReportDetail.scss';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert'
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import { Ban , User , Photo, CircleCheck, Receipt } from 'tabler-icons-react';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class ReportDetail extends Component {

    state={
        id: "",
        limit: 5,
        DialogShowing: false,
        dialogType: "",

        userId: "",

        setSnack: false,
        severity: "",
        message: "",

        restrictedFunctions: [{
            func: "Like",
            time: 7,
        }],

        err: false,
        func: "",
        time: "",
    }

    componentDidMount(){
        const id = this.props.match.params.id;
        this.setState({
            id: id
        })
        this.props.dispatch(getReportDetail(id)).then(response=>{
            console.log(response)
            if(response.payload.reportDetail){
                let detail = response.payload.reportDetail;
                switch(detail.reportType){
                    case "user":
                        this.setState({userId: detail.userId[0]._id});
                        break;
                    case "comment":
                        this.setState({userId: detail.post[0].postedBy[0]._id});
                        break;
                    case "post":
                        this.setState({userId: detail.post[0].postedBy[0]._id});
                        break;
                }
            }
        });    
    }

    componentWillUnmount() {
        this.props.dispatch(clearDetail());
    }

    renderContent = (detail) => {
        switch(detail.reportType){
            case "post": {
                return (
                    <div className="content_wrapper">
                        <p><b>Nội dung:</b></p>
                        <div className="user_info">
                            <img src={detail.post[0].postedBy[0].avt}/>
                            <div className="name">
                                {detail.post[0].postedBy[0].userName}
                            </div>
                        </div>
                        <p>{detail.post[0].description}</p>
                        <div className="images">
                            <img src={detail.post[0].images[0].url} />
                        </div>
                        <p className="likes">
                            <img src={require('../../../asset/newfeed_page/active_like_icon2x.png')} />
                            {detail.post[0].likes.length} lượt thích
                        </p>
                        <div className="comment_list">
                        {
                            this.showComments(detail.post[0].comments)
                        }
                        </div>
                    </div>
                )
            }
            case "comment":{
                const comment = detail.comment[0]; 
                const post = detail.post[0]; 
                return (
                <div className="content_wrapper">
                    <p><b>Nội dung:</b></p>
                    <div className="comment_list">
                        <div className="comment">
                            <div className="user_avt">
                                <img src={comment.postedBy[0].avt} />
                            </div>
                            <div className="content">
                                <b>{comment.postedBy[0].userName}</b> {comment.content}
                                <p>
                                    {comment.likes.length} lượt thích
                                </p>
                            </div>
                        </div>
                    </div>
                    <p>trong bài viết: </p>
                    <div className="user_info">
                        <img src={post.postedBy[0].avt} />
                        <div className="name">
                            {post.postedBy[0].userName}
                        </div>
                    </div>
                    <p>{post.description}</p>
                    <div className="images">
                        <img src={post.images[0].url} />
                    </div>
                    <p className="likes">
                        <img src={require('../../../asset/newfeed_page/active_like_icon2x.png')} />
                        {post.likes.length} lượt thích
                    </p>
                </div>)
            }
            case "user":{
                const user = detail.userId[0];
                const posts = detail.posts; 
                return (
                <div className="content_wrapper">
                    <p><b>Nội dung:</b></p> 
                    <div className="user-info">
                        <div className="account-info">
                            <img src={user.avt}/>
                            <div>
                                <p><b>{user.userName}</b></p>
                                <p><i>{user.bio}</i></p>
                            </div>
                        </div>
                        <p className="segment-title"><User
                                size={22}
                                strokeWidth={3}
                                color={'#7166F9'}
                            /><b>Thông tin cá nhân</b></p>
                        <p><b>Tên:</b> {user.lastname} {user.name}</p>
                        <p><b>Ngày sinh:</b> {user.dob}</p>
                        <p><b>Email:</b> {user.email}</p>
                        <p><b>Đang theo dõi:</b> {user.followings.length}</p>
                        <p><b>Người theo dõi:</b> {user.followers.length}</p>
                    </div>
                    <div className="user-resticted-functions">
                        <p className="segment-title"><Ban
                                size={22}
                                strokeWidth={3}
                                color={'#7166F9'}
                            />
                        <b>Chức năng bị hạn chế</b></p>
                        <ul className="resticted-functions-list">
                            {
                                user.restrictedFunctions.map(item=>{
                                    return this.isRestricted(item)?
                                    <li className="user-resticted-item">
                                        <div>
                                            <b>{item.function}</b>
                                            {moment(item.amountOfTime).format("L")}
                                        </div>
                                        <Button onClick={()=>{
                                            this.setState({
                                                DialogShowing: true,
                                                dialogType: "deleteRestrictedFunctionConfirm",
                                                funcId: item._id,
                                            })
                                        }} variant="outlined" color="primary">
                                            Xóa
                                        </Button>
                                    </li>
                                    : ""
                                })
                            }
                        </ul>
                    </div>
                    <div className="user-posts">
                       <p className="segment-title"><Photo
                                size={22}
                                strokeWidth={3}
                                color={'#7166F9'}
                            /><b>Bài viết gần đây</b></p>
                        <div className="row no-gutters">
                            {
                                posts.map(item=>{
                                    return <div className="col-xl-3 no-gutters">
                                        <img className="post" src={item.images[0].url}/>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                </div>)
            }
        }
    }

    showComments = (comments) => {
        let commentsToShow = [];
        if (comments[0].content) {
            for (let i = 0; i < this.state.limit; i++) {
                if (comments[i] && comments[i].content) {
                    commentsToShow.push(comments[i]);
                }
                else {
                    break;
                }
            }
        }
        return commentsToShow.map((item, i) =>
            item ?
                <div className="comment">
                    <div className="user_avt">
                        <img src={item.postedBy[0].avt} />
                    </div>
                    <div className="content">
                        <b>{item.postedBy[0].userName}</b> {item.content}
                        <p>
                            {item.likes.length} lượt thích
                        </p>
                    </div>
                </div>
            : null
        )
    }

    renderPolicies(list) {
        return list.map((item) => {
            return <div className="policy_content">{item.content}</div>
        })
    }

    AddRestrictedFunction = (func,time) =>{
        if(func == "" || time == ""){
            this.setState({err: true});
        }else{
            if(this.state.restrictedFunctions.some(item => item.func == func)){
                console.log("shdghj");
                let updatedRestrictedFunctions = [...this.state.restrictedFunctions]
                updatedRestrictedFunctions.map(item => {
                    if(item.func == func){
                        item.time = time;
                    }
                })
                this.setState({
                    restrictedFunctions: updatedRestrictedFunctions,
                    err: false,
                })
            }else{
                console.log("tưyeyudghj");
                let updatedRestrictedFunctions = [...this.state.restrictedFunctions]
                updatedRestrictedFunctions.push({func,time})
                this.setState({
                    restrictedFunctions: updatedRestrictedFunctions,
                    err: false,
                })
            }
        }
    }

    deleteContent = () => {
        if (this.props.reports.reportDetail.reportType == "post"){
            this.props.dispatch(deletePost(this.props.reports.reportDetail.post[0]._id, this.state.id))
            .then((response) => {
                console.log(response)
                if (response.payload.report) {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "success", message: "Thành công" })
                } else {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "error", message: "Đã xãy ra lỗi" })
                }
            })
        }else{
            this.props.dispatch(deleteComment(this.props.reports.reportDetail.comment[0]._id, this.state.id))
            .then((response) => {
                console.log(response)
                if (response.payload.report) {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "success", message: "Thành công" })
                } else {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "error", message: "Đã xãy ra lỗi" })
                }
            })
        }
    }

    deleteRestrictedFunction = () =>{
        this.props.dispatch(deleteRestrictedFunction(this.state.funcId, this.props.reports.reportDetail.userId[0]._id))
            .then((response) => {
                console.log(response)
                if (response.payload.success) {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "success", message: "Thành công" })
                } else {
                    this.setState({ DialogShowing: false, setSnack: true, severity: "error", message: "Đã xãy ra lỗi" })
                }
            })
    }

    handleClick = () =>{}

    handleDelete = (func) =>{
        let updatedRestrictedFunctions = [...this.state.restrictedFunctions]
        updatedRestrictedFunctions = updatedRestrictedFunctions.filter(item => 
            item.func != func
        )
        this.setState({
            restrictedFunctions: updatedRestrictedFunctions
        },()=>{console.log(this.state.restrictedFunctions)})
    }
    
    selectFunc = (event) => {
        // console.log(event);
        this.setState({func: event.target.value})
    }
    selectTime = (event) => {
        this.setState({time: event.target.value})
        // console.log(event);
    }

    restrictUserFunction = () =>{
        if(this.state.restrictedFunctions.length == 0){
            this.setState({err: true})
        }else{
            console.log(this.state.userId)
            this.props.dispatch(restrictUser(this.state.restrictedFunctions,this.state.userId,this.state.id)).then(response => {
                console.log(response)
                if(response.payload.success){
                    this.setState({
                        setSnack: true,
                        severity: "success",
                        message: "Thành công",
                        DialogShowing: false,
                    });
                }
            })
        }
    }

    confirmDialog(type) {
        let template = "";
        switch (type) {
            case "invalidReport":
                template = (
                    <div className="deleteConfirm">
                        <h5>Xác nhận báo cáo là không hợp lệ</h5>
                        <div className="btn_wrapper">
                            <p className="cancel_btn" onClick={() => this.setState({ DialogShowing: false })}>Hủy</p>
                            <p className="confirm_btn" onClick={() => this.props.dispatch(updateReport(this.state.id))
                                .then((response) => {
                                    console.log(response)
                                    if(response.payload.report){
                                        this.setState({ DialogShowing: false, setSnack: true, severity:"success", message: "Thành công" })
                                    }else{
                                        this.setState({ DialogShowing: false, setSnack: true, severity: "error", message: "Đã xãy ra lỗi" })
                                    }
                                })}>Xác nhận</p>
                        </div>
                    </div>)
                break;
            case "deleteConfirm":
                template = (
                    <div className="deleteConfirm">
                        <h5> Bạn có chắc chắn xóa nội dung này</h5>
                        <div className="btn_wrapper">
                            <p className="confirm_btn" onClick={() => {this.deleteContent()}} >Xóa nội dung</p>
                            <p className="cancel_btn" onClick={() => this.setState({ DialogShowing: false })}>Hủy</p>
                        </div>
                    </div>)
                break;
             case "deleteRestrictedFunctionConfirm":
                template = (
                    <div className="deleteConfirm">
                        <h5> Bạn có chắc chắn gỡ hạn chế cho tài khoản này?</h5>
                        <div className="btn_wrapper">
                            <p className="confirm_btn" onClick={() => {this.deleteRestrictedFunction()}} >Xóa nội dung</p>
                            <p className="cancel_btn" onClick={() => this.setState({ DialogShowing: false })}>Hủy</p>
                        </div>
                    </div>)
                break;
            case "restrictFunctions":
                template = (
                    <div className="deleteConfirm">
                        <h5> Hạn chế chức năng của người dùng vi phạm</h5>
                        <div className="restricted-functions">
                        {
                            this.state.restrictedFunctions? 
                                this.state.restrictedFunctions.map(item => {
                                    return  <Chip
                                        label={` ${item.func} | ${item.time} ngày `}
                                        onClick={() => this.handleDelete(item.func)}
                                        onDelete={() => this.handleDelete(item.func)}
                                        variant="outlined"
                                        />
                                })
                            :""
                        }
                        <p>{this.state.err?"Vui lòng chọn chức năng và thời gian":""}</p>
                        </div>
                        <div className="add-restricted-functions">
                        <FormControl variant="outlined" className="select">
                            <InputLabel id="demo-simple-select-outlined-label">Chức năng</InputLabel>
                            <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            onChange={(event) => {this.selectFunc(event)}}
                            label="Chức năng"
                            >
                            <MenuItem value="Like">Thích</MenuItem>
                            <MenuItem value="Post">Đăng bài</MenuItem>
                            <MenuItem value="Comment">Bình luận</MenuItem>
                            <MenuItem value="Save">Lưu</MenuItem>
                            <MenuItem value="Follow">Theo dõi</MenuItem>
                            </Select>
                        </FormControl>
                             <FormControl variant="outlined" className="select">
                                <InputLabel id="demo-simple-select-outlined-label">Thời gian</InputLabel>
                                <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                onChange={(event) => {this.selectTime(event)}}
                                label="Thời gian"
                                >
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={15}>15</MenuItem>
                                <MenuItem value={30}>30</MenuItem>
                                </Select>
                            </FormControl>
                            <Button onClick={()=>{this.AddRestrictedFunction(this.state.func, this.state.time)}} variant="outlined" color="primary">
                                Thêm
                            </Button>
                            {/* <button onClick={this.AddRestrictedFunction}>Add</button> */}
                        </div>
                        <div className="btn_wrapper">
                            <p className="cancel_btn" onClick={() => this.setState({ DialogShowing: false })}>Hủy</p>
                            <p className="confirm_btn" onClick={() => {this.restrictUserFunction()}} >Xong</p>
                        </div>
                    </div>)
                break;
            default:
                template = (<div></div>)
                break;
        }

        return <Dialog
            open={this.state.DialogShowing}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => { this.setState({ DialogShowing: false }) }}>
            {template}
        </Dialog>
    }

    isRestricted(restrictedFunction){
        var today = moment().startOf('day').valueOf();
        if(restrictedFunction.amountOfTime>today){
            return true
        }else{
            return false
        }
    }

    render() {
        const detail = this.props.reports.reportDetail;
        return (
            <Layout page="report">
                <div className="report_detail" >
                    <h2 className="page_title">Chi tiết báo cáo</h2>
                    {
                        this.props.reports.reportDetail ?
                            <div className="row no-gutters">
                            <div className="col-xl-6 no-gutters">
                                {
                                    this.renderContent(this.props.reports.reportDetail)
                                }
                            </div>
                                <div className="col-xl-6 no-gutters">
                                <div className="report_info ">
                                    <p><b>Người báo cáo:</b></p>
                                        <div className="user_info">
                                            <img src={detail.sentBy[0].avt} />
                                            <div className="name">
                                                {detail.sentBy[0].userName}
                                            </div>
                                        </div>
                                    <p>Ngày: <b>{moment(detail.createdAt).fromNow()}</b></p>
                                    <p>Tình trạng: <b>{detail.status ?"Đã xử lý":"Chưa xủ lý"}</b></p>
                                    <p>Chính sách vi phạm</p>
                                    <div>
                                        {
                                            this.renderPolicies(detail.reportAbout)
                                        }
                                    </div>
                                    {
                                        !detail.status ? 
                                        <div className="button_wrapper">
                                                <p><b>Xử lý</b></p>
                                                <button className="btn_invalid" onClick={() => {
                                                    this.setState({
                                                        DialogShowing: true,
                                                        dialogType: "invalidReport",
                                                    })
                                                }}>Nội dung không vi phạm</button>
                                                <button className="btn_delete" onClick={() => {
                                                    this.setState({
                                                        DialogShowing: true,
                                                        dialogType: "deleteConfirm",
                                                    })
                                                }}>Xóa nội dung</button>
                                                 <button className="btn_restrict" onClick={() => {
                                                    this.setState({
                                                        DialogShowing: true,
                                                        dialogType: "restrictFunctions",
                                                    })
                                                }}>Hạn chế tài khoản</button>
                                        </div>
                                                : <p>Đã xử lý ngày: <b>{moment(detail.updatedAt).fromNow()} </b></p>
                                    }
                                </div>
                            </div>
                        </div>
                            : <CircularProgress />
                    }
                </div>
                {
                    this.confirmDialog(this.state.dialogType)
                }
                {
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center'
                        }}
                        open={this.state.setSnack}
                        onClose={() => this.setState({ setSnack: false })}
                        autoHideDuration={1000}
                    >
                        <MuiAlert elevation={6} variant="filled" severity={this.state.severity} >{this.state.message}</MuiAlert>
                    </Snackbar>
                }
            </Layout>
        );
    }
}

function mapStateToProps(state) {
    return {
        reports: state.reports
    };
}

export default connect(mapStateToProps)(withRouter(ReportDetail));