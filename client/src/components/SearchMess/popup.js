import React from "react";
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { findPersonal } from '../../actions/message_action';

class Popup extends React.Component {
    
    constructor(props) {
        super(props);
    }
    
    LinkTo = (type,id) =>{
        if(type == "user"){
            this.props.history.push(`/user/${id}`)
        }else{
            this.props.history.push(`/tag/${id}`)
        }
    }

    render() {
        const { items, isOpen, groups } = this.props;
        //Do not show popup
        if (!isOpen) return null;
        return (
            <div className="messpopup">

                <div className="container">
                    <div className="content">
                        <h5>Kết quả tìm kiếm</h5>
                        <h6>Tài khoản</h6>
                        {items &&
                            items.map((item, idx) => {
                                return (
                                    <div className="item" key={idx}>
                                        <div onClick={() => this.props.dispatch(findPersonal(item._id)).then((response)=>{this.props.history.push(`/message/inbox/${response.payload._id}`)})} className="user_infor_wrapper">
                                     
                                            <div className="userinfo">
                                            <img src={item.avt} />
                                            <p>{item.userName}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        }
                        <h6>Nhóm</h6>
                        {groups &&
                            groups.map((group, idx) => {
                                return (
                                    <div className="item" key={idx}>
                                    <div onClick={() =>  this.props.history.push(`/message/inbox/${group._id}`)} className="user_infor_wrapper">

                                          <div className="userinfo">
                                            <img src={group.groupimg?group.groupimg:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ3F_4AEBUvIOQPFqcVFUsh5_eFIAHcdtExdA&usqp=CAU"} />
                                            <p>{group.title}</p>
                                            </div>
                                    </div>
                                    </div>
                                );
                            })
                        }
                        {!items.length && <div className="warning"></div>}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect()(withRouter(Popup));