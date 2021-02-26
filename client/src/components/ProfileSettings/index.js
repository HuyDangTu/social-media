import React, { Component, useEffect, useState } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import { findPost} from '../../../src/actions/user_action';
import Switch from 'react-ios-switch';
import FormField from '../ultils/Form/FormField';
import './profilesetting.scss';
import { populateOptionFields, update, ifFormValid, generateData, resetFields } from '../ultils/Form/FormActions';
import { GridDots, User, Lock } from 'tabler-icons-react'
import { updateprofileimgfile, updateprofileimg, changeProfile, changePassword,auth} from '../../actions/user_action';
import { Link, withRouter, useParams } from 'react-router-dom';
import { Button, CircularProgress, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert'
import Header from '../Header_Footer/Header';

class ProfileSettings extends Component {
    state = {
        privateMode: false,
        inputValue: "",
        settingState: 'profile',
        edited: false,
        loading: false,
        severity: '',
        setSnack: false,

        formError: false,
        formSuccess: false,
        formMessage: "",
        formData: {
            email: {
                element: 'input',
                value: '',
                config: {
                    placeholder: 'Email của bạn',
                    label: 'Email',
                    name: 'email',
                    options: [],
                },
                validation: {
                    required: true,
                    email: true
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: false
            },
            name: {
                element: 'input',
                value: '',
                config: {
                    placeholder: 'Tên của bạn',
                    label: 'Tên',
                    name: 'name',
                    options: [],
                },
                validation: {
                    required: false,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: false
            },
            bio: {
                element: 'textarea',
                value: '',
                config: {
                    placeholder: 'Mô tả về bản thân bạn',
                    label: 'Tiểu sử',
                    name: 'bio',
                    options: [],
                },
                validation: {
                    required: false,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: false
            },
            userName: {
                element: 'input',
                value: '',
                config: {
                    placeholder: 'Tên tài khoản',
                    label: 'Tên tài khoản',
                    name: 'userName',
                    options: [],
                },
                validation: {
                    required: false,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: false
            },
        },
        passwordData:{
            currentPassword: {
                element: 'password',
                config: {
                    label: 'Mật khẩu',
                    name: 'password_input',
                    type: 'password',
                    placeholder: 'Mật khẩu hiện tại'
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: false,
            },
            password: {
                element: 'input',
                config: {
                    label: 'Mật khẩu mới',
                    name: 'password_input',
                    type: 'password',
                    placeholder: 'Mật khẩu mới'
                },
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: false,
            },
            confirmPassword: {
                element: 'input',
                value: '',
                config: {
                    label: 'Nhập lại mật khẩu',
                    name: 'confirm_password_input',
                    type: 'password',
                    placeholder: 'Nhập lại mật khẩu'
                },
                validation: {
                    required: true,
                    confirm: 'password'
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: false,
            }
        }
    }

    updateFields = (newFormData) => {
        this.setState({
            formData: newFormData
        })
    }

    reset(){
        this.setState({
            edited: false,
            loading: false,
            setSnack: false,
            formError: false,
            formMessage: "",
        })
    }

    submitForm = (event) => {
        this.setState({loading:true})
        event.preventDefault();
        this.state.formData.privateMode = this.state.privateMode;
        let dataToSubmit = generateData(this.state.formData, 'update_pro')
        this.props.dispatch(changeProfile(this.props.user.userData._id, dataToSubmit))
            .then(response => {
                console.log(response);
                if(response.payload.success == false)
                {
                    this.setState({loading:false,severity:'error', setSnack: true, formMessage: response.payload.message})
                    
                }
                else
                {
                    this.setState({loading:false,severity:'success',edited:false, setSnack: true, formMessage: response.payload.message})
                    this.props.dispatch(auth());
                }
                
              //  this.props.dispatch(auth());
                
            })
    }

    onFileChange = async (event) => {
        this.setState({ loading: true })
        await this.props.dispatch(updateprofileimgfile(event.target.files[0]));
        await this.props.dispatch(updateprofileimg(this.props.user.img ? this.props.user.img.url : 0))
        .then(response=>
            {
                console.log(response)
            if(response.payload.success == false)
            {
                this.setState({loading:false,severity:'error', setSnack: true, formMessage: response.payload.message})
                
            }
            else
            {
                this.setState({loading:false,severity:'success',edited:false, setSnack: true, formMessage: response.payload.message})
                this.props.dispatch(auth());
            }
        })
    }

    updateForm = (element) => {
        const newFormdata = update(element, this.state.formData, 'update_pro');
        this.setState({
            formError: false,
            formData: newFormdata
        });
             if( JSON.stringify(this.state.formData.bio.value.trim()) != JSON.stringify(this.props.user.userData.bio.trim()) ||
             JSON.stringify(this.state.formData.userName.value.trim()) != JSON.stringify(this.props.user.userData.userName.trim()) ||
             JSON.stringify(this.state.formData.name.value.trim()) != JSON.stringify(this.props.user.userData.name.trim()) ||
             JSON.stringify(this.state.formData.email.value.trim()) != JSON.stringify(this.props.user.userData.email.trim()))
            {
                this.setState({edited:true});
            }
            else
            {
                this.setState({edited:false});
            }
    }

    getUserForm() {
        this.state.formData.bio.value = this.props.user.userData.bio;
        this.state.formData.userName.value = this.props.user.userData.userName;
        this.state.formData.name.value = this.props.user.userData.name;
        this.state.formData.email.value = this.props.user.userData.email;
        const formData = this.state.formData;
        this.setState({edited:false});
        this.updateFields(formData);
    }

    componentDidMount() {
        this.getUserForm();
    }

    handleSetting = (type) => {
        this.setState({ 
            settingState: type,
            edited: false,
            loading: false,
            setSnack: false,
            formError: false,
            formMessage: "" })
    }

    changePassword = (event) => {
        this.setState({ loading: true })
        event.preventDefault();
       
        let dataToSubmit = generateData(this.state.passwordData, 'change_password')
        let formIsValid = ifFormValid(this.state.passwordData, 'change_password');
       
        if (formIsValid){
            console.log(dataToSubmit)
            this.props.dispatch(changePassword(dataToSubmit))
                .then(response => {
                    console.log(response);
                    if(response.payload.success){
                        this.setState({
                            setSnack: true,
                            formMessage: response.payload.message
                        }, () => { resetFields(this.state.passwordData)})
                    }else{
                        this.setState({
                            formError: true,
                            formMessage: response.payload.message
                        })
                    }
                })
        }else{
            this.setState({
                formError: true,
                formMessage: "Vui lòng kiểm tra lại thông tin!"
            })
        }
       
    }

    updatePasswordForm = (element) => {
        const newFormdata = update(element, this.state.passwordData, 'update_password');
        this.setState({
            formError: false,
            passwordData: newFormdata
        });
        this.setState({ edited: true })
    }

    render() {
        return (
            <Layout>
                <div className="setting_container">
                    <div className="setting_wrapper">
                        <div className="row no-gutters">
                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-2 setting_options">
                                {
                                    this.state.settingState == 'profile' ?
                                        <Button className="options" onClick={() => this.handleSetting('profile')}><User size={20} strokeWidth={1} color="black" /><p>Thông tin</p></Button>
                                        :
                                        <Button className="options disable" onClick={() => this.handleSetting('profile')}><User size={20} strokeWidth={1} color="black" /><p>Thông tin</p></Button>
                                }
                                {
                                    this.state.settingState == 'password' ?
                                        <Button className="options" onClick={() => this.handleSetting('password')} ><Lock size={20} strokeWidth={1} color="black" /><p>Đổi mật khẩu</p></Button>
                                        :
                                        <Button className="options disable" onClick={() => this.handleSetting('password')} ><Lock size={20} strokeWidth={1} color="black" /><p>Đổi mật khẩu</p></Button>
                                }
                            </div>
                            {
                                this.state.settingState == 'profile' ?
                                    <form className="col-xl-9 col-lg-9 col-md-9 col-sm-9 col-10 setting_detail" onSubmit={(event) => this.submitForm(event)}>
                                        <div className="row setting_type">
                                            <div className="col-xl-3 col-md-3 col-sm-3 col-4 label">
                                                {
                                                    this.state.loading ?
                                                        <div class="overlay"><CircularProgress style={{ color: '#5477D5' }} thickness={7} />
                                                        </div>

                                                        :
                                                        ''
                                                }
                                                <img src={this.props.user.userData.avt}></img>
                                            </div>
                                            <div className="col-xl-9 col-md-9 col-sm-9 col-8 field">
                                                <h2>{this.props.user.userData.userName}</h2>
                                                <label className="custom-file-upload">
                                                    <input type="file" onChange={this.onFileChange} />
                                                    <h6>Sửa ảnh đại diện</h6>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row setting_type">
                                            <div className="ol-xl-3 col-md-3 label">
                                                <h3>Riêng tư</h3>

                                            </div>
                                            <div className="col-xl-9 col-md-9  field">

                                                <Switch checked={this.state.privateMode} onColor="#7166F9" onChange={() => this.setState({ privateMode: !this.state.privateMode })}>

                                                </Switch>

                                            </div>
                                        </div>
                                        <div className="row setting_type">
                                            <div className="ol-xl-3 col-md-3 label">
                                                <h3>Họ Tên</h3>
                                            </div>
                                            <div className="col-xl-9 col-md-9 field">
                                                <FormField
                                                    //Có thể để trống phần description nên k cần xử lý event onChange,..
                                                    id={'name'}
                                                    formData={this.state.formData.name}
                                                    change={(element) => this.updateForm(element)}
                                                />
                                            </div>
                                        </div>
                                        <div className="row setting_type">
                                            <div className="ol-xl-3 col-md-3  label">
                                                <h3>User name</h3>
                                            </div>
                                            <div className="col-xl-9 col-md-9  field">
                                                <FormField
                                                    //Có thể để trống phần description nên k cần xử lý event onChange,..
                                                    id={'userName'}
                                                    formData={this.state.formData.userName}
                                                    change={(element) => this.updateForm(element)}

                                                />
                                            </div>
                                        </div>
                                        <div className="row setting_type">
                                            <div className="ol-xl-3 col-md-3  label">
                                                <h3>Email</h3>
                                            </div>
                                            <div className="col-xl-9 col-md-9 field">
                                                <FormField
                                                    //Có thể để trống phần description nên k cần xử lý event onChange,..
                                                    id={'email'}
                                                    formData={this.state.formData.email}
                                                    change={(element) => this.updateForm(element)}
                                                />
                                            </div>
                                        </div>
                                        <div className="row setting_type">
                                            <div className="ol-xl-3 col-md-3 label">
                                                <h3>Mô tả</h3>
                                            </div>
                                            <div className="col-xl-9 col-md-9 field">
                                                <FormField
                                                    //Có thể để trống phần description nên k cần xử lý event onChange,..
                                                    id={'bio'}
                                                    formData={this.state.formData.bio}
                                                    change={(element) => this.updateForm(element)}
                                                />
                                            </div>
                                        </div>
                                        {
                                            this.state.formError ?
                                            <div className="row setting_type">
                                                <div className="ol-xl-3 col-md-3 label">
                                                </div>
                                                <div className="col-xl-9 col-md-9 field">
                                                    {this.state.formMessage}
                                                </div>
                                            </div>
                                            : ""
                                        }
                                        <div className="row setting_type">
                                            <div className="ol-xl-3 col-md-3 label">
                                            </div>
                                            {
                                            this.state.edited?
                                                <div className="col-xl-9 col-md-9 field">
                                                <Button className="send_btn" onClick={(event) => { this.submitForm(event) }}>
                                                    Gửi
                                                 </Button>
                                            </div>
                                            :
                                            <div className="col-xl-9 col-md-9  field">
                                                <Button className="send_btn disable" disabled="true" onClick={(event) => { this.submitForm(event) }}>
                                                    Gửi
                                                 </Button>
                                            </div>
                                            }
                                        </div>
                                    </form>
                                    :
                                    <form className="col-xl-9 col-lg-9 col-md-9 col-sm-9 col-10 setting_detail" onSubmit={(event) => this.changePassword(event)}>
                                       
                                        <div className="row setting_type">
                                            <div className="col-xl-3 col-md-3 label">
                                                <h3>Mật khẩu</h3>
                                            </div>
                                            <div className="col-xl-9 col-md-9 field">
                                                <FormField
                                                    id={'currentPassword'}
                                                    formData={this.state.passwordData.currentPassword}
                                                    //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                                    change={(element) => this.updatePasswordForm(element)} />
                                            </div>
                                        </div>
                                        <div className="row setting_type">
                                            <div className="ol-xl-3 col-md-3 label">
                                                <h3>Mật khẩu mới</h3>
                                            </div>
                                            <div className="col-xl-9 col-md-9 field">
                                                <FormField
                                                    id={'password'}
                                                    formData={this.state.passwordData.password}
                                                    //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                                    change={(element) => this.updatePasswordForm(element)}/>
                                            </div>
                                        </div>
                                        <div className="row setting_type">
                                            <div className="ol-xl-3 col-md-3 label">
                                                <h3>Nhập lại</h3>
                                            </div>
                                            <div className="col-xl-9 col-md-9 field">
                                                <FormField
                                                    id={'confirmPassword'}
                                                    formData={this.state.passwordData.confirmPassword}
                                                    //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                                    change={(element) => this.updatePasswordForm(element)}/>
                                            </div>
                                        </div>
                                        {this.state.formError ?
                                            <div className="row setting_type">
                                                <div className="ol-xl-3 col-md-3 label">
                                                </div>
                                                <div className="col-xl-9 col-md-9 field">
                                                    {this.state.formMessage}
                                                </div>
                                             </div>
                                            : ""
                                        }
                                        <div className="row setting_type">
                                            <div className="ol-xl-3 col-md-3 label">
                                            </div>
                                            <div className="col-xl-9 col-md-9 field">
                                                <Button className="send_btn" onClick={(event) => { this.changePassword(event) }}>
                                                    Gửi
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                            }
                        </div>
                    </div>
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center'
                        }}
                        open={this.state.setSnack}
                        onClose={() => this.setState({ setSnack: false })}
                        autoHideDuration={1000}
                    >
                        <MuiAlert elevation={6} variant="filled" severity={this.state.severity} >{this.state.formMessage}</MuiAlert>
                    </Snackbar>
                </div>
               
            </Layout>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps)(withRouter(ProfileSettings));