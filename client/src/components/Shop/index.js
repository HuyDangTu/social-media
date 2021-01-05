import React, { Component } from 'react';
import Layout from '../../hoc/layout';
import PageTop from '../ultils/PageTop'
import {connect} from 'react-redux';
import {getProductsToShop ,getBrands, getWoods} from '../../actions/product_actions';
import CollapseCheckBox from '../ultils/CollapseCheckBox';
import CollapseRadio from '../ultils/CollapseRadio'
import {price} from '../ultils/Form/Price_category';
import './Shop.scss';
import LoadmoreCards from './LoadmoreCards';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faBars from '@fortawesome/fontawesome-free-solid/faBars';
import faTh from '@fortawesome/fontawesome-free-solid/faTh';

class Shop extends Component {
    
    state = {
        grid: '',
        limit: 6,
        skip: 0,
        filters:{
            brands: [],
            wood: [],
            price: []
        }
    }
    
    componentDidMount() {
        this.props.dispatch(getBrands());
        this.props.dispatch(getWoods());
        this.props.dispatch(getProductsToShop(
            this.state.skip,
            this.state.limit,
            this.state.filters,
        )); 
    }
    
    //trả về 1 [] gồm 2 giá trị của filter price vd: [100,199]
    handlePrice = (value) => {
        const data = price;
        let array = [];

        for(let key in data){
            if(data[key]._id === parseInt(value,10)){
                array = data[key].array
            }
        }
        return array;
    }
    
    //Hàm này chạy khi người dùng click chọn vào các option filters
    handleFilters = (filters,category) => {
        const newFilters = {...this.state.filters}
        newFilters[category] = filters;
        
        if(category === 'price'){
            let priceValues = this.handlePrice(filters);
            newFilters[category] = priceValues;
        }
        this.showFilteredResults(newFilters);
        this.setState({
            filters: newFilters
        })
    }
    
    //Hàm này dispatch action để lấy về kết quả khi ng dùng chọn các filters mới
    showFilteredResults = (filters) => {
        this.props.dispatch(getProductsToShop(
            this.state.skip,
            this.state.limit,
            filters
        ))//sau mỗi lần có kết quả mới phải set lại skip = 0, tức là chỉ hiển thị 6 sản phẩm
        .then(()=>{
            this.setState({
                skip:0
            })
        }) 
    }

    //Tải thêm item
    LoadmoreCards = ()=>{
        //tình số item đc skip qua bằng số skip hiện tại cộng với số limit
        let skip = this.state.skip + this.state.limit;

        this.props.dispatch(getProductsToShop(
            skip,
            this.state.limit,
            this.state.filters,
            //truyền vào các item trước sau đó thêm vào các item tiếp theo 
            this.props.products.toShop
        ))// Sau khi lấy ra danh sách mới thì phải set lại skip để load more tiếp tục
        .then(()=>{
            this.setState({
                skip 
            })
        })
    }

    handleGrid= () =>{
        this.setState({
            grid: !this.state.grid ? "grid_bars" : "" 
        })
    }

    render() {
        const products = this.props.products;
        return (
            <Layout>
                <PageTop title="Brower Products"/>
                <div className="shop_container">
                    <div className="shop_wrapper">
                    <div className="row">
                        <div className="col-xl-3 shop_left">
                            <CollapseCheckBox
                                iniState={true}
                                title="Brands"
                                list={products.brands}
                                handleFilters={(filters)=>{
                                    this.handleFilters(filters,'brand')
                                }}
                            />
                            <CollapseCheckBox
                                iniState={false}
                                title="Woods"
                                list={products.woods}
                                handleFilters={(filters) => {
                                    this.handleFilters(filters, 'woods')
                                }}
                            />
                            <CollapseRadio
                                iniState={false}
                                title="Price"
                                list={price}
                                handleFilters={(filters) => {
                                    this.handleFilters(filters, 'price')
                                }}
                            />
                        </div>
                        <div className="col-xl-9 shop_right">
                            <div className="right">
                                <div className="shop_options">
                                    <div className="shop_grids clear">
                                            <div className={`grid_btn ${this.state.grid ? '' : 'active'}`}
                                                onClick={() => this.handleGrid()}
                                            >
                                                <FontAwesomeIcon icon={faBars} />

                                            </div>
                                        <div className={`grid_btn ${this.state.grid ? '':'active'}`}
                                        onClick={()=> this.handleGrid()}
                                        >
                                        <FontAwesomeIcon icon={faTh}/>

                                        </div>
                                       
                                    </div>
                                </div>
                               
                                    <LoadmoreCards
                                    grid={this.state.grid}
                                    limit={this.state.limit}
                                    size={products.toShopSize}
                                    products={products.toShop}
                                    loadMore={()=>{
                                        this.LoadmoreCards()
                                    }}
                                    />
                              
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </Layout>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        products: state.products,
    }
}
export default connect(mapStateToProps)(Shop);