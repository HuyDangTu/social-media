import React from 'react';
import MyButton from '../ultils/button'
import './homePromotion.scss'

const HomePromotion = (props) => {

    const promotion = [
        {
            img: 'images/lasted/promotion_bg.jpg',
            lineOne: 'Up to 40% off',
            lineTwo: 'Start from 10th October 2020',
            linkTitle: 'Shop now',
            linkTo: '/shop'
        }]

    const renderPromotion = () => (
        promotion ? promotion.map((item,i) => (
        <div key = {i}> 
        <div className="promotion_img"
        style={{
            backgroundImage: `url(${item.img})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
        }} >
            <div className='slide_title'>{item.lineOne}</div>
            <div className='slide_low_title'>{item.lineTwo}</div>
            <div>
            <MyButton
            type="default"
            title={item.linkTitle}
            linkTo={item.linkTo}>
            </MyButton>
            </div>
        </div>
        </div>)
       
        ) : null 
    )

    return (
        <div className="home_promotion">
            {renderPromotion()}
        </div>
    );
};

export default HomePromotion;