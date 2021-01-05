import React, { Component } from 'react';
import ImageLightBox from '../ultils/ImageLightBox';

class ProdImg extends Component {

    state = {
        lightbox: false,
        imagePos: 0,
        lightboxImages: []
    }

    componentDidMount(){
        if(this.props.detail.images.length){
            let lightboxImages=[];

            this.props.detail.images.forEach(item =>{
                lightboxImages.push(item.url)
            })
            console.log(lightboxImages);
            this.setState({
                lightboxImages
            })
        }
    }
    renderCardImage =(images) => {
        if(images.length > 0){
            return images[0].url
        }else{
            return `https://cdn.shopify.com/s/files/1/0013/3529/6118/products/Terracotta-Pot-6_Sansevieria-Zeylanica-6.jpg?v=1544979697`
        }
    }

    handlelightBox = (pos) => {
        if(this.state.lightboxImages.length > 0){
            this.setState({
                lightbox: true,
                imagePos: pos,
            })
        }
        console.log(this.state)
    }

    handlelightBoxClose = () => {
        this.setState({
            lightbox: false,
        })
    }
    // showThumbs = () =>(
    //     this.state.lightboxImages.map((item,i)=>(
    //         i > 0 ?
    //             <div
    //             key = {i}
    //             onClick={()=>this.handlelightBox(i)}
    //             className="thumb" 
    //                 style={{
    //                     background: `url(${item})`,
    //                     backgroundPosition: 'center',
    //                     backgroundSize: 'cover',
    //                     backgroundRepeat: 'no-repeat',
    //                     width: '200px', height: '200px'}}
    //             >
    //             </div>
    //         :null
    //     ))
    // )
    render() {
        const {detail} = this.props;
        return (
            <div className="product_image_container">
                <div className="main_pic">
                    <div
                        style={{
                            background: `url(${this.renderCardImage(detail.images)})`,
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            width: '500px', 
                            height: '500px',
                        }}
                        onClick={()=> this.handlelightBox(0)}
                    >
                    </div>
                </div>
                <div className="main_thumbs">
                        {/* {this.showThumbs(detail)} */}
                </div>
                {
                    this.state.lightbox ?
                        <ImageLightBox 
                            id={detail.id}
                            images={this.state.lightboxImages}
                            open={this.state.open}
                            pos={this.state.imagePos}
                            onclose={() => this.handlelightBoxClose()}  
                        />
                    : null
                }
            </div>
        );
    }
}

export default ProdImg;