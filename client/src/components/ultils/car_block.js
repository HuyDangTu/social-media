import React from 'react';
import Card from './card';
import './card_block.scss';

const CardBlock = (props) => {
    
    const renderCards = () =>(
        props.list ? props.list.map((card,i)=>
            (
            <Card
                key={i}
                {...card}
            />
        ))
        :null
    )
    
    return (
        <div className='card_block'>
            <div className='card_container'>
                {
                    props.title ?
                    <div className='card_title'>
                        {props.title}
                    </div>
                    :null
                }
                <div className='cards_wrapper'>
                    {renderCards()}
                </div>
            </div>
        </div>
    );
};

export default CardBlock;