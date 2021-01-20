import React, { Component } from 'react';
import {connect} from 'react-redux';
import {auth} from '../actions/user_action';
import CircularProgress from '@material-ui/core/CircularProgress';


export default function(ComposedClass,reload,adminRoute = null){
    
    class AuthenicationCheck extends Component {
        
        state={
            loading: true,
        }
        
        //Sau khi render
        componentDidMount(){
            //gọi hàm auth trong user_action gửi request đến sever lấy dữ liệu về đưa vào payload
            //hàm auth trả về action -> dispatch action đến userreducer này để cập nhật lại store
            this.props.dispatch(auth()).then(respond =>{

                //Lấy userData từ trong props của class AuthenicationCheck
                let user = this.props.user.userData;
               // console.log(this.props.user);
               //Kiểm tra nếu isAuth false là thì trở lại trang đăng nhập
                if(!user.isAuth){
                    if(reload){
                        if(adminRoute){
                            this.props.history.push(adminRoute);    
                        }else{
                        this.props.history.push('/register_login');
                        }
                    }
                }
                //nếu isAuth true là thì dẫn vào trang newfeed
                else
                {
                    //Là trang của admin
                    if(adminRoute != null){
                        //ng dùng k phải admin chuyển qua trang đăng nhập của admin
                        if(!user.isAdmin){
                            if (reload === true) {
                                this.props.history.push("/Newfeed");
                            }
                        }
                        if (reload === false) {
                            this.props.history.push('/Admin/Dashboard');
                        }
                    }else{
                        if (user.isAdmin) {
                            this.props.history.push('/Admin/Dashboard');
                        }
                        if(reload === false){
                            this.props.history.push('/Newfeed');
                        }
                    }
                }
                this.setState({loading:false});
            })
        }

        render() {
            if(this.state.loading){
                return (
                    <div className="main_loader" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translateX(-50 %) translateY(- 50 %)' }}>
                        <CircularProgress style={{ color: '#5477D5'}} thickness={7}/>
                    </div>
                );
            }else{
                //this.props.user là prop của class AuthenticationCheck
                //{...this.props} để copy luôn các state loading của class AuthenticationCheck
               return <ComposedClass {...this.props} user={this.props.user}/>
            }
        }
    }

    //state trong hàm này là state trong store của redux
    //Hàm này lấy state của reducer user trong store đưa vào làm prop của class AuthenicationCheck
    function mapStateToProps(state){
        return {
            user: state.user,
        }
    }

    return connect(mapStateToProps)(AuthenicationCheck);
}
