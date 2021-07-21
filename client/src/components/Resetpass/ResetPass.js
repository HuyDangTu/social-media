import FormField from '../ultils/Form/FormField';
import axios from 'axios'
import { USER_SERVER } from '../ultils/mise';
import { update, ifFormValid, generateData } from '../ultils/Form/FormActions';
import React, { Component } from 'react';
import './index.scss';

class ResetPass extends Component {
    state = {
        resetToken: "",
        formErrorMessage: "",
        formError: false,
        formSuccess: false,
        formData: {
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
        }
    }

    updateForm = (element) => {
        //Hàm update được viết trong FormActions.js
        const newFormdata = update(element, this.state.formData, 'reset_pass');
        //Cập nhật lại State
        this.setState({
            formError: false,
            formData: newFormdata
        });
    }

    componentDidMount(){
        const resetToken = this.props.match.params.token;
        this.setState({resetToken})
    }

    submitForm = (event) => {
        console.log("submitted")
        event.preventDefault();

        let dataToSubmit = generateData(this.state.formData, 'reset_pass');
        let formIsValid = ifFormValid(this.state.formData, 'reset_pass');

        if (formIsValid) {
            console.log(dataToSubmit, this.state.resetToken);
            axios.post(`${USER_SERVER}/reset_pass`, { ...dataToSubmit,resetToken: this.state.resetToken})
            .then(response => {
                console.log(response.data.success)
                if (response.data.success){
                    this.setState({
                        formSuccess: true,
                        formError: false
                    })
                    setTimeout(()=>{
                        this.props.history.push('/register_login')
                    },3000)
                }
                else{
                    this.setState({
                        formSuccess: false,
                        formError: true,
                        formErrorMessage: response.data.message
                    })
                }
            })
        }
        else {
            this.setState({
                formError: true,
                formSuccess: false,
            })
        }
    }

    render() {
        return (
            <div className="resetPass">
                <div className="banner">
                    <div className='signin__logo'>
                        <img className="logo" src={require('../../asset/login-page/logo2x.png')} />
                        <img className="stunning_text" src={require('../../asset/login-page/stun2x.png')} />
                    </div>
                </div>
                <div className="content">
                    <div className="wrapper">
                        <div className="title">Khôi phục mật khẩu</div>
                    <form className='register__form' onSubmit={(event) => this.submitForm(event)}>
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
                        <button className='signin__button' onClick={(event) => { this.submitForm(event) }}>
                                Reset password
                        </button>
                        {
                            this.state.formError ?
                                <div className="message">
                                    {this.state.formErrorMessage}
                                </div>
                                : null
                        }
                        {
                        this.state.formSuccess ?
                            <div className="message">
                               Done, check your email
                        </div>
                        : null
                        }
                </form>
                </div>
                </div>
            </div>
        );
    }
}

export default ResetPass;