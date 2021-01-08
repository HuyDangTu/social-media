import React from "react";
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

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
        const { items, isOpen, tags } = this.props;
        //Do not show popup
        if (!isOpen) return null;
        return (
            <div className="popup">
                <div className="container">
                    <div className="content">
                        <h5>Tài khoản</h5>
                        {items &&
                            items.map((item, idx) => {
                                return (
                                    <div className="item" key={idx}>
                                        <div onClick={() => {this.LinkTo("user",item._id)}} className="user_infor_wrapper">
                                            <img src={item.avt} />
                                            <p>{item.userName}</p>
                                        </div>
                                    </div>
                                );
                            })
                        }
                        <h5>Thẻ</h5>
                        {tags &&
                            tags.map((tag, idx) => {
                                return (
                                    <div className="item" key={idx}>
                                        <div onClick={() => { this.LinkTo("tag", tag._id)}} className="tag_infor_wrapper">
                                            <h6>#{tag.name}</h6>
                                            <p>{tag.posts.length} Bài viết</p>
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