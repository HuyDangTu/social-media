import React, { Component } from 'react';
import './LoginButton.scss'
import GoogleLogin  from 'react-google-login';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginByFaceGoogle, storeInfoForRegister } from '../../actions/user_action'

class GoogleLoginButton extends Component {

    state = {
        authFailed: false,
        name: "",
        email: "",
        picture: "",
    }

    componentClicked = () =>{
        console.log("Google Authentication");
    }

    loginByGooggle = (response) =>{
        if (response) {
            console.log(response);
            this.props.dispatch(loginByFaceGoogle(response.profileObj.email))
            .then(res => {
                if (res.payload.loginSuccess) {
                    this.props.history.push('/newfeed')
                }else {
                    console.log(response)
                    let data = {
                        name: response.profileObj.familyName + " " + response.profileObj.givenName,
                        email: response.profileObj.email,
                        picture: response.profileObj.imageUrl,
                    }
                    this.props.dispatch(storeInfoForRegister(data));
                    this.props.history.push('/register');
                }
            });
        }
        else {
            console.log(response)
            // this.setState({
            //     formError: true
            // })
        }
    }
    responseGoogle = (response) =>  {
        console.log(response)
    }
    render() {
        let template;
        this.state.authFailed?
            template =(
                <div>
                </div>
            )
            : template = (
            <GoogleLogin 
                clientId="951803019708-gs8na9tkemvqrkj6pcq6s93vku37gn22.apps.googleusercontent.com"
                render={renderProps => (
                     <button onClick={renderProps.onClick} disabled={renderProps.disabled} className='gmail_signin_button' >
                        <img src={require('../../asset/login-page/mail_Icon.png')} />Đăng nhập bằng Gmail
                    </button>
                )}
                buttonText="Login"
                onSuccess={this.loginByGooggle}
                onFailure={this.responseGoogle}
                cookiePolicy={'single_host_origin'}
            />  
        );
        return (
           <>
                {template}
           </>
        );
    }
}

export default connect()(withRouter(GoogleLoginButton));