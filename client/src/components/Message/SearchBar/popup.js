import React from "react";
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Dialog, LinearProgress, Checkbox, Chip } from '@material-ui/core';
import { Settings, Dots, Heart, Pencil, Search, Photo, Sticker, Send, Ghost, Edit, Circle, CircleCheck } from 'tabler-icons-react';

class Popup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sendinguserlistid:[]
        }
    }
    componentDidMount(){
        this.setState({sendinguserlistid: this.props.sendinguserlistid});
    }
    // componentWillReceiveProps(newProps) {
    //     this.setState({sendinguserlist: newProps.sendinguserlist});
    // }
    render() {
        const { items, isOpen, removelist, addList } = this.props;
        //Do not show popup
        if (!isOpen) return null;
        return (
            <div className="new_popup">
                <div className="container">
                    <div className="content">
                        {items &&
                            items.map((item, idx) => {
                                return (
                                    <div className="item" key={idx}>
                                        <div className="user_infor_wrapper">
                                            <div className="userinfo">
                                                <img src={item.avt} />
                                                <p>{item.userName}</p>
                                            </div>
                                            <Checkbox
                                                icon={<Circle size={24} strokeWidth={0.5} color="grey"></Circle>}
                                                checkedIcon={<CircleCheck size={24} strokeWidth={0.5} color="white" fill="#00abfb"></CircleCheck>}


                                          checked={this.state.sendinguserlistid.includes(item._id)}
                                            onChange={() =>
                                                    this.state.sendinguserlistid.includes(item._id) ?
    
                                                    removelist(item._id,item.userName)
                                                         :
                                                        addList(item._id,item.userName)
                                                }

                                            />
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