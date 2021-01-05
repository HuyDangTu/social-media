import React, { Component } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; 

class ImageLightBox extends Component {

    state = {
        lightboxIsOpen: true,
        currentImage: this.props.pos,
        images: this.props.images,
    }
    
    // static getDerivedStateFromProps(props,state){
    //     if(props.images){
    //         const images = [];
    //         props.images.forEach(element =>{
    //             images.push({src: `${element}`})
    //         });
    //         return state = {images}
    //     }
    //     return false;
    // }
    componentWillMount(){
    
        console.log(this.state);
    }
   
    closeLightbox = () => {
        this.props.onclose();
    }
    gotoPrevious =() =>{

    }
    gotoNext = () =>{

    }
    closeLightBox = () =>{

    }
    render() {

        const { images, currentImage } = this.state;
        
        return (
            <div>
                <Lightbox
                    mainSrc={images[currentImage]}
                    nextSrc={images[(currentImage + 1) % images.length]}
                    prevSrc={images[(currentImage + images.length - 1) % images.length]}
                    onCloseRequest={() => this.closeLightbox()}
                    onMovePrevRequest={() =>
                        this.setState({
                            currentImage: (currentImage + images.length - 1) % images.length,
                        })
                    }
                    onMoveNextRequest={() =>
                        this.setState({
                            currentImage: (currentImage + 1) % images.length,
                        })
                    }
                />
            </div>
        );
    }
}

export default ImageLightBox;