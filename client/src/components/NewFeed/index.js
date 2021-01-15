import React, { Component } from 'react';
import Layout from '../../hoc/layout';
import { connect } from 'react-redux';
import { getProductsToShop, getTopTenTags, likePost, getStory} from '../../actions/product_actions';
import './Shop.scss';
import LoadmoreCards from './LoadmoreCards';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faBars from '@fortawesome/fontawesome-free-solid/faBars';
import faTh from '@fortawesome/fontawesome-free-solid/faTh';
import Story from '../Story/index';
import StoryPage from '../Story/StoryPage';
import LoadmoreChart from '../LoadmoreChart/index';
import { Link, withRouter } from 'react-router-dom';
import Search from '../Search/index';
import LoadingCard from '../ultils/LoadingCard/index';
class Newfeed extends Component {

    state = {
        grid: 'grid_bars',
        limit: 2,
        skip: 0,
        isShow:false,
        filters: {
            brands: [],
            wood: [],
            price: []
        },

        tagLimit: 3,
        tagSkip: 0,

        height: window.innerHeight,
        message: 'not at bottom',

        currentDisplay: 0,
        isStoryPageShow: false,

        isloading: true,
    }
    
    constructor(props) {
        super(props);
        this.handleScroll = this.handleScroll.bind(this);
    }
    
    componentDidMount() {
        this.props.dispatch(getProductsToShop(
            this.state.skip,
            this.state.limit,
            this.state.filters,
        ),()=>{this.setState({isloading: false})});
        this.props.dispatch(getTopTenTags(
            this.state.tagSkip,
            this.state.tagLimit,
        ));
        this.props.dispatch(getStory());
        window.addEventListener("scroll", this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
    }

    LoadmoreTags = () => {
        this.setState({isShow: true}) 
    }

    closeTagChart = () => {
        this.setState({ isShow: false }) 
    }

    //Tải thêm post
    LoadmoreCards = () => {
        //tình số item đc skip qua bằng số skip hiện tại cộng với số limit
        let skip = this.state.skip + this.state.limit;
        this.props.dispatch(getProductsToShop(
            skip,
            this.state.limit,
            this.state.filters,
            //truyền vào các item trước sau đó thêm vào các item tiếp theo 
            this.props.products.toShop
        ))// Sau khi lấy ra danh sách mới thì phải set lại skip để load more tiếp tục
        .then(() => {
            this.setState({
                skip,
                isloading: false,
            })
        })
    }

    handleScroll() {
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = Math.ceil(windowHeight + window.pageYOffset);
        //console.log(windowBottom, docHeight, windowHeight)
      
       
        if (windowBottom >= docHeight) {
            if (this.props.products.toShopSize == this.state.limit) {
                console.log(this.props.products.toShopSize, this.state.limit)
                this.setState({isloading: true},()=>{this.LoadmoreCards()});
                //console.log('bottom reached');
            }
        }
    }

    handleGrid = () => {
        this.setState({
            grid: !this.state.grid ? "grid_bars" : "grid_bars"
        })
    }

    likePost = (id) => {
        this.props.dispatch(likePost(id));
    }
    
    setDisplayIndex = (index) => {
        this.setState({
            currentDisplay: index,
            isStoryPageShow: true,
        })
    }
    
    closeStory = () => {
        this.setState({
            currentDisplay: 0,
            isStoryPageShow: false,
        })
    }

    render() {
        const products = this.props.products;
        return (
            <div>
            <Layout>
                <div className="shop_container" onScroll={(event) => this.handleScroll(event)}>
                    <div className="shop_wrapper">
                        <div className="row">
                        <div className="col-xl-8 shop_right">
                            <div className="right">
                                    {/* <Story 
                                        list={products.storyList}
                                        setDisplayIndex={(index)=>this.setDisplayIndex(index)}
                                    /> */}
                                    <div className="shop_options">
                                        {
                                            /* <div>Bài viết mới</div>
                                            <div className="shop_grids clear">
                                                <div className={`grid_btn ${this.state.grid ? '' : 'active'}`}
                                                    onClick={() => this.handleGrid()}
                                                >
                                                    <FontAwesomeIcon icon={faBars} />
                                                </div>
                                                <div className={`grid_btn ${this.state.grid ? '' : 'active'}`}
                                                    onClick={() => this.handleGrid()}
                                                >
                                                    <FontAwesomeIcon icon={faTh} />
                                                </div>
                                            </div> */
                                        }
                                    </div>
                                    {console.log(this.props)}
                                    <LoadmoreCards
                                        grid={this.state.grid}
                                        limit={this.state.limit}
                                        size={products.toShopSize}
                                        products={products.toShop}
                                        loadMore={() => {
                                            this.LoadmoreCards()
                                        }}
                                    />
                                    {
                                        this.state.isloading?
                                        <LoadingCard/>
                                        : ""
                                    }
                                </div>
                            </div>
                        <div className="col-xl-4 shop_left">
                            <div  className="craete_post_button">
                                <div className="craete_button_container">
                                    <img src={require("../../asset/headerIcon/create_icon2x.png")}/>
                                    <Link to="/post/create_post">Thêm bài viết</Link>
                                </div>
                            </div>
                            <LoadmoreChart 
                                title="Xu hướng"
                                isShow={this.state.isShow}
                                topTenTags={products.topTenTag}
                                loadMore={() => this.LoadmoreTags()}
                                close={() => this.closeTagChart()}
                            />
                        </div> 
                        </div>
                    </div>
                </div>
            </Layout>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        products: state.products,
        user: state.user,
    }
}
export default connect(mapStateToProps)(Newfeed);