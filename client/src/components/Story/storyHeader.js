import React from 'react';

const storyHeader = (props) => {
    return (
        <div>
             <div className="info">
                <div className="user_avt">
                    <img src={props.avt} />
                </div>
                <div className="user_info">
                    <span className="user_name">{props.name}</span>
                </div>
            </div>
        </div>
    );
};

export default storyHeader; 