import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../Layout/index';
import { withRouter } from 'react-router-dom';
import { getReportDetail, updateReport, deletePost, clearDetail, deleteComment } from '../../../actions/report_actions';
import CircularProgress from '@material-ui/core/CircularProgress';
import './ReportDetail.scss';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert'

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class ReportDetail extends Component {

    state={
        id: "",
        limit: 5,
        DialogShowing: false,
        dialogType: "",
        setSnack: false,
        severity: "",
        message: ""
    }

    componentDidMount(){
        const id = this.props.match.params.id;
        this.setState({
            id: id
        })
        this.props.dispatch(getReportDetail(id));    
    }

    componentWillUnmount() {
        this.props.dispatch(clearDetail());
    }

    renderContent = (detail) => {
        if(detail.reportType == "post"){
        return (
            <div className="content_wrapper">
                <p>Nội dung: </p>
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
        )}else{
            const comment = detail.comment[0]; 
            const post = detail.post[0]; 
            return (
            
            <div className="content_wrapper">
                
                    <p>Nội dung: </p>

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

    deleteContent = () => {
        if (this.props.reports.reportDetail == "post"){
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
                        <h5> Bạn chắc chắn muốn xóa nội dung này?</h5>
                        <div className="btn_wrapper">
                            <p className="cancel_btn" onClick={() => this.setState({ DialogShowing: false })}>Hủy</p>
                            <p className="confirm_btn" onClick={() => {this.deleteContent()}} >Xóa</p>
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

    render() {
        const detail = this.props.reports.reportDetail;
        return (
            <Layout page="report">
                <div className="report_detail" >
                    <h1>Chi tiết báo cáo</h1>
                    {
                        this.props.reports.reportDetail ?
                        <div className="row">
                            <div className="col-xl-6">
                                {
                                    this.renderContent(this.props.reports.reportDetail)
                                }
                            </div>
                            <div className="col-xl-6">
                                <div className="report_info">
                                    <p>Người bán cáo: </p>
                                        <div className="user_info">
                                            <img src={detail.sentBy[0].avt} />
                                            <div className="name">
                                                {detail.sentBy[0].userName}
                                            </div>
                                        </div>
                                    <p>Ngày: <b>{detail.createdAt}</b></p>
                                    <p>Tình trạng: <b>{detail.status ? "Đã xử lý" : "Chưa xử lý"}</b></p>
                                    <p>Chính sách vi phạm</p>
                                    <div>
                                        {
                                            this.renderPolicies(detail.reportAbout)
                                        }
                                    </div>
                                   
                                    {
                                        !detail.status ? 
                                        <div className="button_wrapper">
                                                <p>Xử lý</p>
                                                <button className="btn_invalid" onClick={() => {
                                                    this.setState({
                                                        DialogShowing: true,
                                                        dialogType: "invalidReport",
                                                    })
                                                }}>Không đồng ý</button>
                                                <button className="btn_delete" onClick={() => {
                                                    this.setState({
                                                        DialogShowing: true,
                                                        dialogType: "deleteConfirm",
                                                    })
                                                }}>Đồng ý</button>
                                        </div>
                                        : <p>Đã xử lý ngày: <b>{detail.updatedAt}</b></p>
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