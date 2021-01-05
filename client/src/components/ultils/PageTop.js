import React from 'react';

const PageTop = (props) => {
    return (
        <div className="page_top" style={{
           borderBottom: '1px solid #CBCBCB'}}>
            <div className="title" 
            style={{width: '80%',
                margin:'0 auto',
                padding: '20px 0px 20px 0px',
                
                }}>
                {props.title} 
            </div>
        </div>
    );
};

export default PageTop;