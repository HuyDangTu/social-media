import React from 'react';
import Card from '../ultils/card';
import './card_block_shop.scss';
const cardWidth = 100/3;
const CardBlockShop = (props) => {
    const renderCards = () => (
        props.list ? 
            props.list.map(card => (
                <Card 
                    key={card._id}
                    {...card} 
                    grid={props.grid}
                />
            ))
        :null
    )
    
    return (
        <div className="card_block_shop">
            {props.list?
                props.list.length === 0 ?
                    <div className="no_result">
                            "Sorry, no result"
                    </div>
                :null
            :null}
            {renderCards()}
        </div>
    );
};

export default CardBlockShop;