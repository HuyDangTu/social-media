import {
    GET_PRODUCTS_BY_SELL,
    GET_PRODUCTS_BY_ARRIVAL,
    GET_WOODS,
    GET_BRANDS,
    GET_PRODUCTS_TO_SHOP,
    ADD_PRODUCT,
    CLEAR_PRODUCT,
    ADD_BRAND,
    ADD_WOOD,
    GET_POST_DETAIL,
    CLEAR_PRODUCT_DETAIL,
    GET_TOP10_TAGS,
    LIKE_POST,
    COMMENT_POST,
    HIDE_POST,
    UPDATE_DETAIL,
    LIKE_DETAIL,
    LIKE_COMMENT,
    HIDE_POST_DETAIL,
    DELETE_COMMENT,
    DELETE_POST,
    CLEAR_POST_DETAIL,
    REPORT_POST,
    GET_STORY,
    UPDATE_POST,
    UPDATE_POST_DETAIL,
    VIEW_STORY,
    CREATE_STORY,
} from '../actions/types';


export default function (state = {}, action) {
    switch (action.type) {
        case GET_PRODUCTS_BY_SELL: {
            return {...state,bySell: action.payload}
        }
        case GET_PRODUCTS_BY_ARRIVAL: {
            return { ...state, byArrival: action.payload }
        }
        case GET_BRANDS:{
            return {...state,brands:action.payload}
        }
        case GET_WOODS:{
            return { ...state, woods: action.payload }
        }
        case GET_PRODUCTS_TO_SHOP: {
            return { ...state, 
                    toShop: action.payload.posts,
                    toShopSize: action.payload.size,
                }
        }
        case ADD_PRODUCT:{
            return {
                ...state,
                addProduct: action.payload
            }
        }
        case CLEAR_PRODUCT:{
            return {
                ...state, 
                addProduct: action.payload
            }
        }
        case ADD_BRAND: {
            return {
                ...state,
                addBrand: action.payload.success,
                brands: action.payload.brands
            }
        }
        case ADD_WOOD: {
            return {
                ...state,
                addWoods: action.payload.success,
                woods: action.payload.woods
            }
        }
        case GET_POST_DETAIL:{
            console.log(action.payload);
            return {
                ...state, 
                postDetail: action.payload
            }
        }
        case CLEAR_POST_DETAIL: {
            return {
                ...state,
                postDetail: action.payload
            }
        }
        case GET_TOP10_TAGS: {
            return { 
                ...state, 
                topTenTag: action.payload.topTenTags,
                size: action.payload.size
            }
        }
        case LIKE_POST: {
            let updatedPosts = [...state.toShop]
            updatedPosts = updatedPosts.map(item => {
                if (item._id == action.payload._id) {
                    return action.payload
                } else {
                    return item
                }
            })
            console.log("data", updatedPosts);
            return {
                ...state,
                toShop: updatedPosts,
            }
        }
        case LIKE_DETAIL: {
            return {
                ...state,
                postDetail: action.payload,
            }
        }
        case COMMENT_POST: {
            let updatedPosts = [...state.toShop]
            updatedPosts = updatedPosts.map(item => {
                if (item._id == action.payload._id) {
                    return action.payload
                } else {
                    return item
                }
            })
            return {
                ...state,
                toShop: updatedPosts,
            }
        }
        case UPDATE_POST:{
            let updatedPosts = [...state.toShop]
            updatedPosts = updatedPosts.map(item => {
                if (item._id == action.payload.post[0]._id) {
                    return action.payload.post[0]
                } else {
                    return item
                }
            })
            return {
                ...state,
                updatePost: action.payload.success,
                toShop: updatedPosts,
            }
        }
        case UPDATE_POST_DETAIL:{
            return {
                ...state,
                updatePost: action.payload.success,
                postDetail: action.payload.post[0],
            }
        }
        case LIKE_COMMENT:{
            return {
                ...state,
                postDetail: action.payload,
            }
        }
        case UPDATE_DETAIL: {
            return {
                ...state,
                postDetail: action.payload,
            }
        }
        case HIDE_POST: {
            let updatedPosts = [...state.toShop]
            console.log(action.payload.postId);
            updatedPosts = updatedPosts.filter(item => 
               item._id !== action.payload.postId
            );
            console.log("data", updatedPosts);
            return {
                ...state,
                toShop: updatedPosts,
            }
        }
        case HIDE_POST_DETAIL:{
            return {
                ...state
            }
        }
        case DELETE_COMMENT:{
            return {
                ...state,
                postDetail: action.payload,
            }
        }
        case DELETE_POST: {
            let updatedPosts = [...state.toShop]
            console.log(action.payload.post._id);
            updatedPosts = updatedPosts.filter(item =>
                item._id !== action.payload.post._id
            );
            console.log("data", updatedPosts);
            return {
                ...state,
                toShop: updatedPosts,
            }
        }
        case REPORT_POST:{
            return {
                ...state,
            }
        }
        case GET_STORY: {
            return {
                ...state,
                storyList: action.payload, 
            }
        }
        case VIEW_STORY: {
          
        }
        case CREATE_STORY: {
             return {
                ...state,
                storyList: action.payload.stories, 
            }
        }
        default: return state;
    }
}