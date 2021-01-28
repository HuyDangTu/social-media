import FormField from '../ultils/Form/FormField';
import axios from 'axios'
import { USER_SERVER } from '../ultils/mise';
import { update, ifFormValid, generateData } from '../ultils/Form/FormActions';
import React, { Component } from 'react';
import './index.scss';

class ResetUser extends Component {
    state = {
        formError: false,
        formSuccess: '',
        formData: {
            email: {
                element: 'input',
                value: '',
                config: {
                    label: 'Email',
                    name: 'email_input',
                    type: 'email',
                    placeholder: 'Nhập email của bạn'
                },
                validation: {
                    required: true,
                    email: true
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: false
            }
        }
    }
    updateForm = (element) => {
        //Hàm update được viết trong FormActions.js
        const newFormdata = update(element, this.state.formData, 'reset_email');
        //Cập nhật lại State
        this.setState({
            formError: false,
            formData: newFormdata
        });

    }
    submitForm = (event) => {
        event.preventDefault();

        let dataToSubmit = generateData(this.state.formData, 'reset_email');

        let formIsValid = ifFormValid(this.state.formData, 'reset_email');

        if (formIsValid) {
            //console.log(dataToSubmit)
            axios.post(`https://myreactsocialnetwork.herokuapp.com/api/users/reset_user`, dataToSubmit)
                .then(response => {
                    if (response.data.success)
                        this.setState({
                            formSuccess: true,
                            formError: false
                        })
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
                        <div className="title">Reset password</div>
                        <FormField
                            id={'email'}
                            formData={this.state.formData.email}
                            change={(element) => this.updateForm(element)}
                        />
                        <button className='signin__button' onClick={(event) => { this.submitForm(event) }}>
                            Send Email to reset password
                        </button>
                        {
                            this.state.formSuccess ?
                                <div className="message">
                                    Done, check your email
                                </div>
                                : null
                        }
                        {
                            this.state.formError ?
                                <div className="message">
                                    Please check your data
                                </div>
                                : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default ResetUser;