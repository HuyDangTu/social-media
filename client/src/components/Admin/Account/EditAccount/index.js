import React, { Component, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Switch from 'react-ios-switch';
import FormField from '../../../ultils/Form/FormField';
import './profilesetting.scss';
import { update, generateData,ifFormValid, resetFields  } from '../../../ultils/Form/FormActions';
import { User, Lock } from 'tabler-icons-react'
import { updateprofileimgfile, updateprofileimg, changeProfile, updateprofile, auth, changePassword } from '../../../../actions/user_action';
import { withRouter } from 'react-router-dom';
import { Button, CircularProgress, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert'
import Layout from '../../Layout/index';

class EditAccount extends Component {
    state = {
        privateMode: false,
        inputValue: "",
        settingState: 'profile',
        edited: false,
        formError: false,
        formSuccess: false,
        loading: false,
        setSnack: false,
        severity: "",
        message: "",
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
        passwordData: {
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

    reset() {
        this.setState({
            edited: false,
            loading: false,
            setSnack: false,
            formError: false,
            formMessage: "",
        })
    }

    changePassword = (event) => {
        event.preventDefault();

        let dataToSubmit = generateData(this.state.passwordData, 'change_password')
        let formIsValid = ifFormValid(this.state.passwordData, 'change_password');

        if (formIsValid) {
            console.log(dataToSubmit)
            this.props.dispatch(changePassword(dataToSubmit))
                .then(response => {
                    console.log(response);
                    if (response.payload.success) {
                        this.setState({
                            setSnack: true, severity: "success", message: "Thành công",
                            //formMessage: response.payload.message
                        }, () => { resetFields(this.state.passwordData) })
                    } else {
                        this.setState({
                            formError: true,
                            formMessage: response.payload.message
                        })
                    }
                    this.props.dispatch(auth());
                })
        } else {
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
    }


    updateFields = (newFormData) => {
        this.setState({
            formData: newFormData
        })

    }
    submitForm = (event) => {
        this.setState({ loading: true })
        event.preventDefault();
        this.state.formData.privateMode = this.state.privateMode;
        let dataToSubmit = generateData(this.state.formData, 'update_pro')
        this.props.dispatch(changeProfile(this.props.user.userData._id, dataToSubmit))
            .then(response => {
                console.log(response)
                this.props.dispatch(auth());
                this.setState({ loading: false, setSnack: true, severity: "success", message: "Thành công" })
            })
    }
    updateForm = (element) => {
        const newFormdata = update(element, this.state.formData, 'update_pro');
        this.setState({
            formError: false,
            formData: newFormdata
        });
        this.setState({ edited: true })
    }
    onFileChange = async (event) => {
        this.setState({ loading: true })
        await this.props.dispatch(updateprofileimgfile(event.target.files[0]));
        await this.props.dispatch(updateprofileimg(this.props.user.img ? this.props.user.img.url : 0));
        await this.props.dispatch(auth());
        // await Headers.props.dispatch(updateprofileimg(this.props.user.img ? this.props.user.img.url : 0));
        await this.setState({ loading: false, setSnack: true, severity: "success", message: "Thành công"  });
        return (
            <Layout>
            </Layout>
        )
    }
    getUserForm() {
        this.state.formData.bio.value = this.props.user.userData.bio;
        this.state.formData.userName.value = this.props.user.userData.userName;
        this.state.formData.name.value = this.props.user.userData.name;
        this.state.formData.email.value = this.props.user.userData.email;
        const formData = this.state.formData;
        this.setState({ edited: false });
        this.updateFields(formData);
    }
    componentDidMount() {
        this.getUserForm();
    }
    handleSetting = (type) => {
        this.setState({ settingState: type })
    }

    render() {

        return (
            <Layout page="account">
                <div className="editAccount">
                    <div className="page_title">
                        <h3>Cài đặt tài khoản</h3>
                    </div>
                    <div className="title">
                        <h5>Thông tin</h5>
                    </div>
                    <div className="row  no-gutters ">
                        <form className="col-xl-12 no-gutters setting_detail" onSubmit={(event) => this.submitForm(event)}>
                            <div className="row  no-gutters  setting_type">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 no-gutters label">
                                {this.state.loading ?
                                    <div class="overlay"><CircularProgress style={{ color: '#5477D5' }} thickness={7} />
                                    </div>:''}
                                    <img src={this.props.user.userData.avt}></img>
                                </div>
                                <div className="col-xl-10 col-lg-10 col-md-10 col-sm-10 col-10 field">
                                            <h2>{this.props.user.userData.userName}</h2>
                                            <label className="custom-file-upload">
                                                <input type="file" onChange={this.onFileChange} />
                                                <h6>Chỉnh sửa ảnh đại diện</h6>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="row  no-gutters  setting_type">
                                <div className="col-xl-2 col-lg-2 col-md-2 no-gutters  label">
                                            <h3>Tên tài khoản</h3>
                                        </div>
                                <div className="col-xl-10 col-lg-10 col-md-10 field">
                                            <FormField
                                                id={'userName'}
                                                formData={this.state.formData.userName}
                                                change={(element) => this.updateForm(element)}

                                            />
                                        </div>
                                    </div>

                                    <div className="row  no-gutters  setting_type">
                                <div className="col-xl-2 col-lg-2 col-md-2 no-gutters label">
                                            <h3>Tên</h3>
                                        </div>
                                <div className="col-xl-10 col-lg-10 col-md-10 field">
                                            <FormField
                                               
                                                id={'name'}
                                                formData={this.state.formData.name}
                                                change={(element) => this.updateForm(element)}
                                            />
                                        </div>
                                    </div>

                                    <div className="row  no-gutters  setting_type">
                                <div className="col-xl-2 col-lg-2 col-md-2 no-gutters label">
                                            <h3>Email</h3>
                                        </div>
                                <div className="col-xl-10 col-lg-10 col-md-10 field">
                                            <FormField
                                                id={'email'}
                                                formData={this.state.formData.email}
                                                change={(element) => this.updateForm(element)}
                                            />
                                        </div>
                                    </div>

                                    <div className="row  no-gutters  setting_type">
                                <div className="col-xl-2 col-lg-2 col-md-2  no-gutters  label">
                                        </div>
                                        {
                                            this.state.edited ?
                                        <div className="col-xl-10 col-lg-10 col-md-10 field">
                                                <Button className="send_btn" onClick={(event) => { this.submitForm(event) }}>
                                                        Gửi
                                                </Button>
                                                </div>
                                                :
                                        <div className="col-xl-10 col-lg-10 col-md-10 field">
                                                    <Button className="send_btn disable" disabled="true" onClick={(event) => { this.submitForm(event) }}>
                                                        Cập nhật
                                            </Button>
                                                </div>
                                        }
                                    </div>
                                </form>
                    </div>
                    <div className="title">
                        <h5 >Mật khẩu</h5>
                    </div>
                    <div className="row  no-gutters ">
                        <form className="col-xl-12 no-gutters setting_detail" onSubmit={(event) => this.changePassword(event)}>

                            <div className="row  no-gutters  setting_type">
                                <div className="col-xl-2 col-lg-2 col-md-2 no-gutters  label">
                                    <h3>Mật khẩu</h3>
                                </div>
                                <div className="col-xl-10 col-lg-10 col-md-10 field">
                                    <FormField
                                        id={'currentPassword'}
                                        formData={this.state.passwordData.currentPassword}
                                        //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                        change={(element) => this.updatePasswordForm(element)} />
                                </div>
                            </div>

                            <div className="row  no-gutters  setting_type">
                                <div className="col-xl-2 col-lg-2 col-md-2 no-gutters label">
                                    <h3>Mật khẩu mới</h3>
                                </div>
                                <div className="col-xl-10 col-lg-10 col-md-10 field">
                                    <FormField
                                        id={'password'}
                                        formData={this.state.passwordData.password}
                                        //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                        change={(element) => this.updatePasswordForm(element)} />
                                </div>
                            </div>

                            <div className="row  no-gutters  setting_type">
                                <div className="col-xl-2 col-lg-2 col-md-2 label">
                                    <h3>Nhập lại</h3>
                                </div>
                                <div className="col-xl-10 col-lg-10 col-md-10 field">
                                    <FormField
                                        id={'confirmPassword'}
                                        formData={this.state.passwordData.confirmPassword}
                                        //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                        change={(element) => this.updatePasswordForm(element)} />
                                </div>
                            </div>     

                            {
                                this.state.formError ?
                                <div className="row setting_type">
                                        <div className="col-xl-2 col-lg-2 col-md-2 label">
                                    </div>
                                        <div className="col-xl-10 col-lg-10 col-md-10 field">
                                        {this.state.formMessage}
                                    </div>
                                </div>
                                : ""
                            }
                            <div className="row  no-gutters  setting_type">
                                <div className="col-xl-2 col-lg-2 col-md-2 no-gutters label">
                                </div>
                                {
                                    <div className="col-xl-10 col-lg-10 col-md-10 field">
                                        <Button className="send_btn" onClick={(event) => { this.changePassword(event) }}>
                                            Cập nhật
                                        </Button>
                                    </div>
                                }
                            </div>
                        </form>
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
                    <MuiAlert elevation={6} variant="filled" severity={this.state.severity} >{this.state.message}</MuiAlert>
                </Snackbar>
            </Layout>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps)(withRouter(EditAccount));