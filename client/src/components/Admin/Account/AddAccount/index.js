import React, { Component } from 'react';
import { connect } from 'react-redux';
import FormField from '../../../ultils/Form/FormField';
import './AddAccount.scss';
import Dialog from '@material-ui/core/Dialog';
import { update, generateData, ifFormValid } from '../../../ultils/Form/FormActions';
import { withRouter } from 'react-router-dom';
import { registerUser } from '../../../../actions/user_action';
import MyButton from '../../../ultils/button'
import GoogleLoginButton from '../../../GoggleLoginButton/GoogleLoginButton';
import FacebookLoginButton from '../../../FacebookLoginButton/FacebookLoginButton';
import Layout from '../../Layout/index';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert'

class AddAccount extends Component {
    state = {
        formError: false,
        ErrorMessage: "",
        formSuccess: false,
        RegisterWith: false,
        setSnack: false,
        severity: "",
        message: "",
        formData: {
            name: {
                element: 'input',
                value: '',
                config: {
                    label: 'Tên',
                    name: 'name_input',
                    type: 'text',
                    placeholder: 'Họ tên'
                },
                validation: {
                    required: true,
                },
                valid: true,
                touched: false,
                validationMessage: '',
                showlabel: false,
            },
            email: {
                element: 'input',
                value: '',
                config: {
                    label: 'Email',
                    name: 'email_input',
                    type: 'email',
                    placeholder: 'Email'
                },
                validation: {
                    required: true,
                    email: true
                },
                valid: true,
                touched: false,
                validationMessage: '',
                showlabel: false,
            },
            userName: {
                element: 'input',
                value: '',
                config: {
                    label: 'Tên người dùng',
                    name: 'userName_input',
                    type: 'text',
                    placeholder: 'Tên người dùng'
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
                    label: 'Mật khẩu',
                    name: 'password_input',
                    type: 'password',
                    placeholder: 'Mật khẩu'
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
        },
    }

    // componentDidMount(){
    //     if(this.props.user.RegisterInfo)
    //         this.setState({ RegisterWith: true})
    // }

    updateForm = (element) => {
        console.log(this.state)
        const newFormdata = update(element, this.state.formData, 'register');
        this.setState({
            formError: false,
            formData: newFormdata
        });
    }

    submitForm = (event) => {
        event.preventDefault();

        let dataToSubmit = generateData(this.state.formData, 'register');

        let formIsValid = ifFormValid(this.state.formData, 'register');

       
        if (formIsValid) {
            console.log(dataToSubmit);
            console.log("OK");
            dataToSubmit.role = 1;
            this.props.dispatch(registerUser(dataToSubmit))
                .then(response => {
                    if (response.payload.success) {
                        this.setState({
                            formError: false,
                            formSuccess: true
                        });
                        setTimeout(() => {
                            this.props.history.push('/register_login')
                        }, 3000);
                    } else {
                        this.setState({
                            formError: true,
                            ErrorMessage: response.payload.message
                        });
                    }
                }).catch(e => {
                    this.setState({ formError: true })
                })
        }
        else {
            this.setState({
                formError: true
            })
        }
    }


    Register = (event) => {
        event.preventDefault();

        let dataToSubmit = generateData(this.state.formData, 'register');      
        let formIsValid = ifFormValid(this.state.formData, 'register');

        if (formIsValid) {
            console.log(dataToSubmit);
            console.log("OK");
            this.props.dispatch(registerUser(dataToSubmit))
                .then(response => {
                    if (response.payload.success) {
                        this.setState({
                            formError: false,
                            formSuccess: true,
                            severity: "success",
                            message: "Thành công",
                        });
                        setTimeout(() => {
                            this.props.history.push('/Admin/Account')
                        }, 3000);
                    } else {
                        this.setState({
                            formError: true,
                            ErrorMessage: response.payload.message
                        });
                    }
                }).catch(e => {
                    this.setState({
                        formError: true
                    })
                })
        }
        else {
            this.setState({
                formError: true
            })
        }
    }

    render() {
        return (
            <Layout page="account">
                <div className="create_account">
                <h2>Thêm Admin </h2>
                <div className="row no-gutters">
                        <div className="col-xl-5 no-gutters">
                            <div className="right">
                                <div className="register">
                                    <div className='register__container'>
                                        <form className='register__form' onSubmit={(event) => this.submitForm(event)}>
                                            <div className="register__row2">
                                                <FormField
                                                    id={'name'}
                                                    formData={this.state.formData.name}
                                                    change={(element) => this.updateForm(element)}
                                                />
                                                <FormField
                                                    id={'email'}
                                                    formData={this.state.formData.email}
                                                    change={(element) => this.updateForm(element)}
                                                />
                                                <FormField
                                                    id={'userName'}
                                                    formData={this.state.formData.userName}
                                                    change={(element) => this.updateForm(element)}
                                                />
                                                <FormField
                                                    id={'password'}
                                                    formData={this.state.formData.password}
                                                    //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                                    change={(element) => this.updateForm(element)}
                                                />
                                                <FormField
                                                    id={'confirmPassword'}
                                                    formData={this.state.formData.confirmPassword}
                                                    //Hàm change nhận vào một element và gọi đến hàm updateForm(element) 
                                                    change={(element) => this.updateForm(element)}
                                                />
                                            </div>
                                            {
                                                this.state.formError ?
                                                <div className="errorLabel">
                                                    {this.state.ErrorMessage}
                                                </div>
                                                : ''}
                                            <button className='register__button' onClick={(event) => { this.submitForm(event) }}>Thêm</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-7 no-gutters"></div>
                    </div>
            </div>
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
const mapStateToProps = (state) => {
    return {
        user: state.user,
    }
}
export default connect(mapStateToProps)(withRouter(AddAccount));