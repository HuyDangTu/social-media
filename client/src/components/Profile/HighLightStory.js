import React, { Component } from 'react';
import './Story.scss';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import {deleteHighLightStory,editHighLightStory} from '../../actions/user_action';
import FormField from '../ultils/Form/FormField';
import { populateOptionFields, update, ifFormValid, generateData, resetFields } from '../ultils/Form/FormActions';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

class HighLightStory extends Component {
  
    state={
        AdvancedBtn: "",
        dialogType: "",
        
        DialogShowing: false,
        commentSelected: "",

        confirmDialogShowing: false,
        storyId: "",

        setSnack: false,
        Success: false,
        Message: '', 

        highLightStory: [],
        editHighlightStoryDiaglog: false,

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
        console.log(this.props.list);
        return (
            <div className="highlightStory">
                <div className="stories">
                    <ul>
                        {
                            this.props.list ?
                                this.props.list.map((item,index) =>{
                                    return (
                                        <li 
                                            onMouseEnter={() => this.setState({ AdvancedBtn: item._id})}
                                            onMouseLeave={() => this.setState({ AdvancedBtn: "" })}
                                            className="has-story">
                                          
                                            <div className="story_wrapper" onClick={() => {this.props.setIndex(index); this.props.openDialog()}} >
                                                <img src={item.storyList[0].image.url}/>
                                            </div>
                                            <span className="user">{item.name}</span>
                                             
                                            <img onClick={() => { this.setState({ 
                                                DialogShowing: true, 
                                                storyId: item._id,
                                                highLightStory: [...item.storyList.map(item=>item._id)],
                                                formData: {
                                                        ...this.state.formData,
                                                        name:{
                                                            ...this.state.formData.name,
                                                            value: item.name
                                                        }
                                                    },
                                                formSuccess: true, 
                                                formMessage: "Thêm thành công",
                                                })
                                            }} 
                                                className={`adavnced-btn ${this.state.AdvancedBtn == item._id? "btn-displayed": "btn-hiden"}`}
                                                src={require('../../asset/headerIcon/advance_button2x.png')}/>
                                        </li>
                                    )
                                })
                            : ""                            
                        }
                        {
                        this.props.createButton ?   
                            <li className="has-story" onClick={this.props.open}>
                                <div className="story_add_button">
                                    <div className="avatar" onClick={()=>{this.props.openCreateHighlightStoryDiaglog()}}>
                                        <div className="add_icon" >
                                            +
                                        </div>
                                    </div>
                                </div>
                                <span className="user">New</span>
                            </li>
                        :null
                        }
                    </ul>
                </div>
                {
                    this.state.DialogShowing ?
                    <Dialog
                    open={this.state.DialogShowing}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={() => { this.setState({ DialogShowing: false }) }}>
                    <div className="commentHandle">
                    {
                        <div>
                            <p className="delete_button"
                                onClick={() => {
                                    this.setState({confirmDialogShowing: true, DialogShowing: false})
                                }}>Xóa</p>
                            <hr />
                            <p className="report_button"
                                onClick={() => {
                                    this.setState({
                                        editHighlightStoryDiaglog: true,
                                                                        
                                    }) 
                                }}>Chỉnh sửa</p>
                        </div>
                    }
                </div>
                </Dialog>
                : ""
                }
                {
                    this.state.confirmDialogShowing?
                    <Dialog
                    open={this.state.confirmDialogShowing}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={() => { this.setState({ confirmDialogShowing: false, DialogShowing: true }) }}>
                    <div className="commentHandle">
                    {
                         <div className="deleteConfirm">
                            <h5> Bạn chắc chắn muốn xóa?</h5>
                            <div className="btn_wrapper">
                                <p className="cancel_btn" 
                                    onClick={()=>this.setState({ 
                                        confirmDialogShowing: false, 
                                        DialogShowing: true
                                    })}
                                >Hủy</p>
                                <p className="confirm_btn" 
                                    onClick={() => this.props.dispatch(deleteHighLightStory(this.state.storyId))
                                    .then((response) => {
                                        console.log(response)
                                        if(response.payload.success){
                                            this.setState({setSnack: true,Success: true,Message: "Xóa thành công",DialogShowing: false,confirmDialogShowing: false,})
                                        }else{
                                            this.setState({setSnack: true,Success: false,Message: "Đã xãy ra lỗi!",DialogShowing: true,confirmDialogShowing: false})
                                        }
                                    })}
                                >Xóa</p>
                            </div>
                        </div>
                    }
                    </div>
                    </Dialog>
                    :""
                }
                    <Dialog
                        fullWidth={true}
                        maxWidth="lg"  
                        className="createHighLightStoryForm"  
                        onClose={() => {this.setState({ editHighlightStoryDiaglog: false })}} 
                        open={this.state.editHighlightStoryDiaglog}
                    >
                    <div className="wrapper">
                        <div className="row no-gutters">
                            <div className="col-lg-3 no-gutters">
                                <div className="row no-gutters form-header">
                                <h5>Chỉnh sửa</h5>
                                <FormField
                                    id={'name'}
                                    formData={this.state.formData.name}
                                    change={(element) => this.updateForm(element)}
                                />
                                <div className="header-feature">
                                    <button className="btn btn-cancel">Hủy</button>
                                    <button className="btn" 
                                        onClick={()=>{
                                            if(this.state.formSuccess && this.state.highLightStory.length != 0)
                                            {
                                                let dataToSubmit = {
                                                    name: this.state.formData.name.value,
                                                    storyList: [...this.state.highLightStory],
                                                    storyId: this.state.storyId,
                                                }
                                                console.log("dô",dataToSubmit);
                                                this.props.dispatch(editHighLightStory(dataToSubmit)).then(response=>{
                                                    if(response.payload.success){
                                                        this.setState({
                                                            setSnack: true,
                                                            Success: true,
                                                            Message: "Chỉnh sửa thành công",
                                                            DialogShowing: false,
                                                            editHighlightStoryDiaglog: false,
                                                        })
                                                    }else{
                                                        this.setState({
                                                            Success: true,
                                                            Message:"Lỗi! Vui lòng thử lại",
                                                            setSnack: true
                                                        })
                                                    }
                                                })
                                            }else{
                                                console.log(this.state.formError,this.state.highlightStory)
                                                this.setState({addStorySuccess: false,formMessage:"Vui lòng kiểm tra thông lại thông tin :(",setSnack: true})
                                            }
                                    }}>Lưu</button>      
                                </div>
                            </div>
                            </div>
                            <div className="col-lg-9 no-gutters">
                                {
                                 this.props.storyList?                            
                                    <div className="row no-gutters form-content">
                                    {
                                    
                                            this.props.storyList.map((item,index)=>{
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
                                    :"loading"
                                }
                            </div>
                        </div>
                    </div> 
                </Dialog>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                open={this.state.setSnack}
                onClose={() => this.setState({ setSnack: false })}
                autoHideDuration={1000}
            >
                <MuiAlert elevation={6} variant="filled" severity={`${this.state.Success?"success":"warning"}`} >{this.state.Message}</MuiAlert>
            </Snackbar>  
        </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(withRouter(HighLightStory));