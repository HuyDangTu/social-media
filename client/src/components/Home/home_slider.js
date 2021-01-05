import React from 'react';
import Slider from 'react-slick'
import MyButton from '../ultils/button'
import './homeSlider.scss'
const HomeSlider = (props) => {

    const setting = {
        dots: false,
        infinite: true,
        speed: 100,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
    }
    
    // const renderCardImage = (images) => {
    //     if (images.length > 0) {
    //         return images[0];
    //     } else {
    //         return 'https://cdn.shopify.com/s/files/1/0013/3529/6118/products/Terracotta-Pot-6_Sansevieria-Zeylanica-6.jpg?v=1544979697';
    //     }
    // }

    const generateSlides = () => (
        props.slides ? props.slides.map((item,i)=>(
           <div key={i}>
                <div className="slider_image"
                     style={{
                         background: `url(${item})`
                        }}
                >
                </div>
           </div>
         ))
         :null                
    )

    return (
        <div>
            <Slider {...setting}>
                {generateSlides()}
            </Slider>
        </div>
    );
};

export default HomeSlider;