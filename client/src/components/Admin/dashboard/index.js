import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../Layout/index';
import './dashboard.scss'
import { getAll, sort} from '../../../actions/report_actions';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withRouter } from 'react-router-dom';


class Dashboard extends Component {
    state={
        limit: 4,
        skip: 0,
        filter: ["all"],
        sortBy: {type: "date", order: 1},
        isloading: false,
    }


    componentDidMount(){
        this.props.dispatch(getAll(
            this.state.limit, this.state.skip, this.state.filter
        ));
    }

    renderReportContent = (item) => {
        switch(item.reportType){
            case "post":
                return (
                    <p>
                        <b className="name" >{item.sentBy[0].userName}</b> đã báo cáo một bài viết của <b className="name" >{item.post.postedBy[0].userName}</b> 
                    </p>
                )
            case "user":
                return (
                    <p>
                        <b>{item.sentBy[0].userName}</b> đã báo cáo người dùng  <b className="name" >{item.post.postedBy[0].userName}</b>
                    </p>
                )
            case "comment":
                return (
                    <p>
                        <b className="name" >{item.sentBy[0].userName}</b> đã báo cáo bình luận viết của <b className="name" >{item.comment.postedBy[0].userName}</b>
                    </p>
                )
        }
    }
    
    renderType = (type) =>{
        switch(type){
            case "user":
                return "Người dùng"
            case "post":
                return "Bài viết"
            case "comment":
                return "Bình luận"
        }
    }

    loadmore = () =>{
        this.setState({ isloading: true });
        let skip = this.state.skip + this.state.limit;
        this.props.dispatch(getAll(
            this.state.limit,
            skip,
            this.state.filter,
            this.props.reports.list,
        )).then(() => {
            sort(this.state.sortBy, this.props.reports.list)
            this.setState({
                skip: skip,
                isloading: false
            }, () => {console.log("here",this.props.reports.list)})
        })
    }

    filter = (type) => {
        this.setState({isloading: true});
        const filter = [type]
        this.props.dispatch(getAll(
            4,
            0,
            filter,
            [],
        )).then(() =>
            this.setState({
                limit: 4,
                skip: 0,
                filter: [type],
                isloading: false
            })
        )
    }

    order = (type) =>{
        switch (type){
            case "date":
                if (this.state.sortBy.type=="date"){
                    this.setState({sortBy: {type: "date",order: this.state.sortBy.order*-1}},()=>{
                       sort(this.state.sortBy,this.props.reports.list)
                })
                }else{
                    this.setState({ sortBy: { type: "date", order: 1 }}, () => {
                        sort(this.state.sortBy, this.props.reports.list)
                    })
                }
                break;
            case "status":
                if (this.state.sortBy.type =="status") {
                    this.setState({ sortBy: { type: "status", order: this.state.sortBy.order * -1 } }, () => {
                        sort(this.state.sortBy, this.props.reports.list)
                    })
                } else {
                    this.setState({ sortBy: { type: "status", order: 1}}, () => {
                        sort(this.state.sortBy, this.props.reports.list)
                    })
                }
                break;
            case "type":
                if (this.state.sortBy.type =="reportType") {
                    this.setState({ sortBy: { type: "reportType", order: this.state.sortBy.order * -1 }}, () => {
                        sort(this.state.sortBy, this.props.reports.list)
                    })
                } else {
                    this.setState({ sortBy: { type: "reportType", order: 1 }}, () => {
                        sort(this.state.sortBy, this.props.reports.list)
                    })
                }
                break;     
        }
      
    }
    
    postedDate(day) {
        console.log(day);
        day = parseInt(day);
        console.log(typeof day)
        if (day < 30) {
            return day + " ngày";
        } else if (day <= 1 && day > 0.0417) {
            console.log(day);
            return (day * 24) + " giờ";
        } else if (day <= 0.0417) {
            console.log(day);
            return (day * 24 * 60) + " phút";
        }
    }
    toDetail = (item) => {
        this.props.history.push(`/Admin/ReportDetail/${item._id}`);
    }
    
    render() {
        const {reports} = this.props
        console.log()
        return (
            <div>
                <Layout page="report">
                    <div className="dashboard">
                        <h2 className="page_title">Danh sách báo cáo</h2>
                        <div className="button">
                            <div class="dropdown filter">
                                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                {
                                    this.state.filter[0]
                                }
                                </button>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <a class="dropdown-item" href="#" onClick={()=>this.filter("all")}>Tất cả</a>
                                    <a class="dropdown-item" href="#" onClick={() =>this.filter("user")}>Người dùng</a>
                                    <a class="dropdown-item" href="#" onClick={() =>this.filter("post")}>Bài viết</a>
                                    <a class="dropdown-item" href="#" onClick={() =>this.filter("comment")}>Bình luận</a>
                                </div>
                            </div>
                            <div class="dropdown filter">
                                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    { this.state.sortBy.type }
                                </button>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <a class="dropdown-item" href="#" onClick={() => this.order("date")}>Mới nhất</a>
                                    <a class="dropdown-item" href="#" onClick={() => this.order("type")}>Loại</a>
                                    <a class="dropdown-item" href="#" onClick={() => this.order("status")}>Trạng thái</a>
                                </div>
                            </div>
                        </div>
                      
                        {
                            reports.list ? 
                            <table className="report-list">
                                <tr className="table-header">
                                    <th className="report">Báo cáo</th>
                                    <th className="status">Loại</th>
                                    <th className="admin" >Tình trạng</th>
                                </tr>
                                {
                                    reports.list.map((item) => (
                                    <tr className="table-content" onClick={()=>this.toDetail(item)}>
                                        <td className="report">
                                        <div className="wrapper">
                                            <img className="avt" src={item.sentBy[0].avt} />
                                            <div className="report_info">
                                                {this.renderReportContent(item)}
                                                <p className="date">{item.dateDifference >= 30 ? item.createdAt : this.postedDate(item.dateDifference)}</p>
                                            </div>
                                        </div>
                                        </td>
                                        <td className="admin">{  this.renderType(item.reportType)}</td>
                                        <td className="status">{item.status?"Đã xử lý": "Chưa xử lý"}</td>
                                    </tr>
                                    ))
                                }
                            </table>
                            : <LinearProgress />
                        }
                        {
                            this.state.isloading ?
                                <LinearProgress />
                            :
                            reports.size >= this.state.limit ?
                                <button className="loadmore" onClick={()=>{this.loadmore()}}>Load more</button>
                                : ""
                        }
                       
                    </div>
                </Layout>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        reports: state.reports,
        user: state.user
    };
}

export default connect(mapStateToProps)(withRouter(Dashboard));