import React from 'react';

const TagDisplay = (props) => {
    
    console.log(props.list,props.isShow);
    const renderCards = () => (
        props.list ? 
        props.list.map((item,i)=>{
            if(i<props.isShow){
                return <li>
                    <a href={`tag/${props.list[i]._id}`}>#{props.list[i].name}</a>
                    <p>{props.list[i].length}</p>
                </li>
            }
        })
        : null
    )
    return (
        <div>
            {props.list ?
                props.list.length === 0 ?
                    <div className="no_result">
                        "Sorry, no result"
                    </div>
                    : null
                : null
            }
            <ul>
            {renderCards()}
            </ul>
        </div>
    )
}
export default TagDisplay;