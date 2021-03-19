import React from 'react';
import './Reaction.scss';
const Reaction = () => {
    return (
        <div className="reaction">
            <h5 className="reaction-title">Quick Reaction</h5>
            <div className="reaction-wrapper">
                <div className="reaction-item">
                    <img className="reaction-icon" src={require("../../asset/react-icon/love.png")}/>
                </div>
                <div className="reaction-item">
                    <img className="reaction-icon" src={require("../../asset/react-icon/care.png")}/>
                </div>
                <div className="reaction-item">
                    <img className="reaction-icon" src={require("../../asset/react-icon/haha.png")}/>
                </div>
                <div className="reaction-item">
                    <img className="reaction-icon" src={require("../../asset/react-icon/wow.png")}/>
                </div>
                <div className="reaction-item">
                    <img className="reaction-icon" src={require("../../asset/react-icon/sad.png")}/>
                </div>
                <div className="reaction-item">
                    <img className="reaction-icon" src={require("../../asset/react-icon/angry.png")}/>
                </div>
            </div>
        </div>
    );
};

export default Reaction;