import FormField from '../ultils/Form/FormField';
import axios from 'axios'
import { USER_SERVER } from '../ultils/mise';
import { update, ifFormValid, generateData } from '../ultils/Form/FormActions';
import React, { Component } from 'react';

class ResetUser extends Component {
    state = {
        formError: false,
        formSuccess: '',
        formData: {
            email: {
                element: 'input',
                value: '',
                config: {
                    label: 'Tên tài khoản',
                    name: 'email_input',
                    type: 'email',
                    placeholder: ''
                },
                validation: {
                    required: true,
                    email: true
                },
                valid: false,
                touched: false,
                validationMessage: '',
                showlabel: true
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
            axios.post(`${USER_SERVER}/reset_user`, dataToSubmit)
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
            <div>
                <FormField
                    id={'email'}
                    formData={this.state.formData.email}
                    change={(element) => this.updateForm(element)}
                />
                {
                    this.state.formSuccess ?
                        <div>
                            Done, check your email
                        </div>
                        : null
                }
                {
                    this.state.formError ?
                        <div>
                            Please check your data
                        </div>
                        : null
                }
                <button className='signin__button' onClick={(event) => { this.submitForm(event) }}>
                    Send Email to reset password
                </button>
            </div>
        );
    }
}

export default ResetUser;