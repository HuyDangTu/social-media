import React, { Component } from 'react';
import { connect } from 'react-redux';
import { report } from '../../actions/product_actions';
import { Link, withRouter } from 'react-router-dom';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import './report.scss';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class Report extends Component {

    state = {
        reportPolicy:[],
        reportCompleted: false,
    }

    pullPolicy(item){
        let newreportPolicy = [...this.state.reportPolicy]
        newreportPolicy.splice(this.state.reportPolicy.indexOf(item._id), 1);
        console.log(newreportPolicy);
        this.setState({ reportPolicy: newreportPolicy })
    }
    pushPolicy(item){
        let newreportPolicy = [...this.state.reportPolicy]
        newreportPolicy.push(item._id);
        console.log(newreportPolicy);
        this.setState({ reportPolicy: newreportPolicy })
    }

    renderPolicies(list){
        return list.map((item)=>{
            return <p 
                onClick={()=>{
                    this.state.reportPolicy.includes(item._id) ?
                        this.pullPolicy(item) : this.pushPolicy(item)
                    }} 
                    className={this.state.reportPolicy.includes(item._id) ? "active_policy_content":"policy_content"}
                    >
                {item.content}</p>
        })
    }

    render(){
        return (
            <Dialog
            open={this.props.isReportFormShow}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => { 
                this.setState({
                    reportPolicy: [],
                    reportCompleted: false
                });
                this.props.closeReportForm()}}>
           
            <div className="reportForm">
                <h5> BÁO CÁO VI PHẠM </h5>
                {
                    this.state.reportCompleted ?
                        "Cảm ơn bạn đã báo cáo!"
                    :
                    <div>
                        <h6>Hãy chọn chính sách vi phạm</h6>
                        <div className="reportPolicies">
                            {
                                this.props.list?
                                this.renderPolicies(this.props.list)
                                : ""
                            }
                        </div>
                        <div className="btn_wrapper">
                            <p className="cancel_btn" 
                                        onClick={() => {
                                            this.setState({ reportPolicy: [], reportCompleted: false}); 
                                                this.props.closeReportForm()}}>Hủy</p>
                            <p className="send_button" 
                                onClick={() => {this.props.dispatch(report(this.props.reportData,this.state.reportPolicy))
                                .then(response => {
                                    this.setState({
                                        reportPolicy: [],
                                        reportCompleted: true, 
                                    })
                                })}}>
                                Báo cáo</p>
                        </div>
                    </div>
                }
                
            </div>
        </Dialog>  
    )}
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(withRouter(Report));