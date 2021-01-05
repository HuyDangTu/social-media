import React from 'react';
import CardBlockShop from '../ultils/card_block_shop';

const LoadmoreCards = (props) => {
    return (
        <div>
        <CardBlockShop 
            grid={props.grid}
            list={props.products}
            />
            {/* {
                props.size > 0 && props.size >= props.limit ?
                    <div className="load_more_container">
                        <span onClick={() => props.loadMore()}>
                            Load More
                        </span>
                    </div>
                :null
            } */}
        </div>
    );
};

export default LoadmoreCards;