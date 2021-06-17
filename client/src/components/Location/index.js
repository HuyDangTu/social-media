import React, { Component } from 'react';
import { connect } from 'react-redux';
import './location.scss'
import Layout from '../../hoc/layout';
import { findLocation } from '../../actions/product_actions';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Link, withRouter } from 'react-router-dom';
import Geocode from "react-geocode";


// import {
//     StaticGoogleMap,
//     Marker,
//     Path,
//   } from 'react-static-google-map';
Geocode.setApiKey("AIzaSyC2UANhvpqKx54aeIVGQk8q0FBCJThlVm4");
class Location extends Component {

    state = {
        name: "",
        isLoading: false,
        lat:'',
        long:''
    }

    componentDidMount() {
        const name = this.props.match.params.name;
        this.setState({
            name: name
        })
        this.props.dispatch(findLocation(name))
    }

    // followTag(id,previousState) {
    //     this.props.dispatch(followTag(id, previousState));
    // }

    // unfollowTag(id, previousState) {
    //     this.props.dispatch(unfollowTag(id, previousState));
    // }

    // LoadmoreCards = () => {
    //     let skip = this.state.skip + this.state.limit;
    //     this.props.dispatch(getTag(
    //         this.state.id,
    //         this.state.skip,
    //         this.state.limit
    //     ))
    //     .then(() => {
    //         this.setState({
    //             isLoading: false,
    //             skip
    //         })
    //     })
    // }

    // handleScroll() {
    //     const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    //     const body = document.body;
    //     const html = document.documentElement;
    //     const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    //     const windowBottom = Math.ceil(windowHeight + window.pageYOffset);
    //     console.log(windowBottom, docHeight, windowHeight)
    //     if (windowBottom >= docHeight) {
    //         this.setState({ isLoading: true }, () => { this.LoadmoreCards()});
    //         console.log('bottom reached');
    //     }
    // }
    
    render() {
        Geocode.fromAddress(this.state.name).then(
            (response) => {
              const { lat, lng } = response.results[0].geometry.location;
              this.setState({lat:lat,long:lng})
              console.log(lat, lng);
            },
            (error) => {
              console.error(error);
            }
          );
        console.log(this.props.products);
        return (

            this.props.products.matchlocation?
            <Layout>
            <div className="TagPage">
                <div className="tag_info">
                {/* <StaticGoogleMap size="600x300" apiKey="AIzaSyC2UANhvpqKx54aeIVGQk8q0FBCJThlVm4">
  <Marker
    location={{ lat: this.state.lat, lng: this.state.long }}
    color="blue"
    label="P"
  />
  <Path
    points={[
        this.state.lat, this.state.long,
        this.state.lat, this.state.long,
        this.state.lat, this.state.long,
        this.state.lat, this.state.long,
    ]}
  />
</StaticGoogleMap> */}
                  
                        <div className="tag_name">
                            <h3>{this.state.name}</h3>
                            <h6>{this.props.products.matchlocation.length} Bài viết</h6>
                        </div>
                       
                   
                </div>
                <div className="posts">
                    <div className="row">
                        {
                        this.props.products? this.props.products.matchlocation.map((item)=>{
                            return item.hidden ? null :
                            (
                                <div className="col-xl-4 col-md-4  pb-3 pt-3 ">
                                <div className="image-wrapper" onClick={()=>{
                                        this.props.history.push(`/postDetail/${item._id}`)
                                }} style={{backgroundImage: `url(${item.images[0].url})`}}>
                                    
                                </div>
                            </div>)
                        }):''
                        }
                    </div>
                </div>
                {
                    this.state.isLoading ?
                    <div className="main_loader" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translateX(-50 %) translateY(- 50 %)'
                    }}>
                        <CircularProgress style={{ color: '#5477D5' }} thickness={7} />
                    </div>
                    :""
                }
            </div>
            </Layout>
            : ""
        );
    }
}
function mapStateToProps(state) {
    return {
        products: state.products
    };
}
export default connect(mapStateToProps)(withRouter(Location));