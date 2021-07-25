import React, { Component } from 'react';
import { connect } from 'react-redux';
import FormField from '../ultils/Form/FormField';
import {populateOptionFields,updateFields} from '../ultils/Form/FormActions';
import './register.scss';
import Dialog from '@material-ui/core/Dialog';
import { update, generateData, ifFormValid } from '../ultils/Form/FormActions';
import { withRouter } from 'react-router-dom';
import { registerUser, getNationality} from '../../actions/user_action';
// import {  } from '../../actions/product_actions';
import MyButton from '../ultils/button'
import GoogleLoginButton from '../GoggleLoginButton/GoogleLoginButton';
import FacebookLoginButton from '../FacebookLoginButton/FacebookLoginButton';

class Register extends Component {
    state = {
        formError: false,
        ErrorMessage: "",
        formSuccess: false,
        RegisterWith: false, 
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
            dob: {
                element: 'input',
                value: '',
                valueAsNumber: "",
                config: {
                    label: 'Ngày sinh',
                    name: 'dob',
                    type: 'date',
                    placeholder: 'ngày sinh'
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
            },
            nationality: {
                element: 'select',
                value: '',
                config: {
                    label: 'nationality',
                    name: 'nationality',
                    options: []
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

    updateFields = (newFormData) => {
        this.setState({
            formData:newFormData
        })
    }


    componentDidMount(){
        const formData = this.state.formData;

        this.props.dispatch(getNationality()).then(response =>{
            console.log(response)
            const newFormData = populateOptionFields(formData, response.payload,'nationality')
            this.updateFields(newFormData)
        })
    }

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

        dataToSubmit.name = this.props.user.RegisterInfo.name;
        dataToSubmit.email = this.props.user.RegisterInfo.email;
        dataToSubmit.avt = this.props.user.RegisterInfo.picture;
        if (formIsValid) {
            console.log(dataToSubmit);
            console.log("OK");
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
            <div className="register">
                <div className="register_page_container">
                    <div className="row no-gutters">
                        <div className="col-xl-6 col-lg-6 col-md-6 no-gutters">
                            <div className="left">
                                <div className="register_slogan">
                                    <img className="logo" src='./images/landingPage/logoIcon2x.png' />
                                    <h1>Begin</h1>
                                    <h1>your</h1>
                                    <h1>Journey</h1>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-6 col-md-6  no-gutters">
                            <div className="right">
                                <div className="register">
                                    <div className='register__container'>
                                    {
                                        this.props.user.RegisterInfo ?
                                        <div>
                                            <form className='register__form' onSubmit={(event) => this.submitForm(event)}>
                                                <div className='avt_wrapper'>
                                                    <img className="avt" src={this.props.user.RegisterInfo.picture} />
                                                </div>
                                                <div className="register__row2">
                                                    <input disabled className="display_input" type="text" value={this.props.user.RegisterInfo.name}/>
                                                    <input disabled className="display_input" type="text" value={this.props.user.RegisterInfo.email}/>                                                   
                                                    <FormField
                                                        id={'userName'}
                                                        formData={this.state.formData.userName}
                                                        change={(element) => this.updateForm(element)}
                                                    />
                                                    <FormField
                                                        id={'nationality'}
                                                        formData={this.state.formData.nationality}
                                                        change={(element) => this.updateForm(element)}
                                                    />
                                                    <FormField
                                                        id={'dob'}
                                                        formData={this.state.formData.dob}
                                                        change={(element) => this.updateForm(element)}
                                                    />
                                                    <FormField
                                                        id={'password'}
                                                        formData={this.state.formData.password}
                                                        change={(element) => this.updateForm(element)}
                                                    />
                                                    <FormField
                                                        id={'confirmPassword'}
                                                        formData={this.state.formData.confirmPassword}
                                                        change={(element) => this.updateForm(element)}
                                                    />
                                                </div>
                                                {this.state.formError ?
                                                    <div className="errorLabel">
                                                        {this.state.ErrorMessage}
                                                    </div>
                                                        : ''}
                                                    <button className='register__button' onClick={(event) => { this.Register(event) }}>Đăng ký</button>
                                                    <div className="register_wrapper">
                                                        <div className="label">
                                                            Đã có tài khoản?
                                                        </div>
                                                        <div className="Signin_link">
                                                            <MyButton
                                                                type="default"
                                                                title="Đăng nhập"
                                                                linkTo="/register_login"
                                                            />
                                                        </div>
                                                    </div>
                                            </form>
                                        </div>
                                        :
                                        <form className='register__form' onSubmit={(event) => this.submitForm(event)}>
                                            <div className='register__logo'>
                                                <img className="logo" src={require('../../asset/login-page/logo2x.png')} />
                                                <img className="stunning_text" src={require('../../asset/login-page/stun2x.png')} />
                                            </div>
                                            <GoogleLoginButton/>
                                            <FacebookLoginButton/>
                                            <div className="or_label">
                                                HOẶC
                                            </div>
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
                                                    id={'nationality'}
                                                    formData={this.state.formData.nationality}
                                                    change={(element) => this.updateForm(element)}
                                                />
                                                <FormField
                                                    id={'dob'}
                                                    formData={this.state.formData.dob}
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
                                            {this.state.formError ?
                                            <div className="errorLabel">
                                                PLease check yoour data!
                                            </div>
                                            : ''}
                                            <button className='register__button' onClick={(event) => { this.submitForm(event) }}>Đăng ký</button>
                                            <div className="register_wrapper">
                                                <div className="label">
                                                    Đã có tài khoản?
                                                </div>
                                                <div className="Signin_link">
                                                    <MyButton
                                                        type="default"
                                                        title="Đăng nhập"
                                                        linkTo="/register_login"
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    }    
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        user: state.user,
    }
}
export default connect(mapStateToProps)(withRouter(Register));