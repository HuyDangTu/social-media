import React from 'react';
import {Link} from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faCartPlus from '@fortawesome/fontawesome-free-solid/faCartPlus';
import faShoppingBag from '@fortawesome/fontawesome-free-solid/faShoppingBag';

const MyButton = (props) => {
    const button = () =>{
        let template = '';

        switch(props.type){
            case 'default':
                return template = <Link
                className = {!props.altClass?"link_default": props.altClass}
                to={props.linkTo}
                    {...props.addStyles}>{props.title}</Link>            
            case 'bag_link':
                return template =
                <div className='bag_link'
                    onClick ={()=>{
                      props.runAction()
                    }}>
                    <FontAwesomeIcon
                    icon ={faCartPlus} />
                </div>
            case "add_to_cart_link":
                return template = 
                    <div className="add_to_cart_link"
                        onClick={()=>{
                        props.runAction()
                    }}>
                        <FontAwesomeIcon
                            icon={faShoppingBag}
                        />
                        Add to cart
                    </div>
            default:
                template ='';
        }
        return template
    }

    return (
        <div className="my_link">
            {button()}
        </div>
    );
};

export default MyButton;