import React from 'react';
import './Reaction.scss';
const Reaction = (props) => {
    return (
        <div className="reaction">
            <h5 className="reaction-title">Quick Reaction</h5>
            <div className="reaction-wrapper">
                <div className="reaction-item">
                    <img onClick={()=>{props.sendReact("https://res.cloudinary.com/dlikyyfd1/image/upload/v1627100146/love_ivuz6x.png")}} 
                    className="reaction-icon" src={require("../../asset/react-icon/love.png")}/>
                </div>
                <div className="reaction-item">
                    <img onClick={()=>{props.sendReact("https://res.cloudinary.com/dlikyyfd1/image/upload/v1627100147/care_kqslc8.png")}}
                    className="reaction-icon" src={require("../../asset/react-icon/care.png")}/>
                </div>
                <div className="reaction-item">
                    <img onClick={()=>{props.sendReact("https://res.cloudinary.com/dlikyyfd1/image/upload/v1627100147/haha_hfh9cz.png")}}
                    className="reaction-icon" src={require("../../asset/react-icon/haha.png")}/>
                </div>
                <div className="reaction-item">
                    <img onClick={()=>{props.sendReact("https://res.cloudinary.com/dlikyyfd1/image/upload/v1627100147/wow_yyiqub.png")}}
                    className="reaction-icon" src={require("../../asset/react-icon/wow.png")}/>
                </div>
                <div className="reaction-item">
                    <img onClick={()=>{props.sendReact("https://res.cloudinary.com/dlikyyfd1/image/upload/v1627100148/sad_b2spg6.png")}} 
                    className="reaction-icon" src={require("../../asset/react-icon/sad.png")}/>
                </div>
                <div className="reaction-item">
                    <img onClick={()=>{props.sendReact("https://res.cloudinary.com/dlikyyfd1/image/upload/v1627100146/angry_dd1sux.png")}} 
                    className="reaction-icon" src={require("../../asset/react-icon/angry.png")}/>
                </div>
            </div>
        </div>
    );
};

export default Reaction;