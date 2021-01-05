import axios from 'axios';
import { PRODUCT_SERVER, USER_SERVER, TAG_SERVER, POST_SERVER, STORY_SERVER } from '../components/ultils/mise';

import {
    GET_PRODUCTS_BY_SELL,
    GET_PRODUCTS_BY_ARRIVAL,
    GET_BRANDS,
    GET_WOODS,
    GET_PRODUCTS_TO_SHOP,
    ADD_PRODUCT,
    CLEAR_PRODUCT,
    ADD_BRAND,
    ADD_WOOD,
    GET_POST_DETAIL,
    CLEAR_POST_DETAIL,
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
    REPORT_POST,
    GET_STORY,
    UPDATE_POST,
    UPDATE_POST_DETAIL,
} from './types';

export function getPostDetail(id){
    const request = axios.get(`${POST_SERVER}/postDetail?id=${id}&type=single`)
    .then(response=>{
       return response.data
    })
    console.log(request);
    return {
        type: GET_POST_DETAIL,
        payload: request,
    }
}

// export function clearPostDetail(){
//     const request = {}
//     return {
//         type: CLEAR_POST_DETAIL,
//         payload: request,
//     }
// }

export function getProductsBySell(){
    
    //articles?sortBy=sold&order=desc&limit=4
    const request = axios.get(`${PRODUCT_SERVER}/articles?sortBy=sold&order=desc&limit=4`)
        .then(response => response.data);
    console.log(request)
    return {
        type: GET_PRODUCTS_BY_SELL,
        payload: request
    }
}

export function getProductsByArrival(){
    const request = axios.get(`${PRODUCT_SERVER}/articles?sortBy=createAt&order=desc&limit=4`)
        .then(response => response.data);
    console.log(request)
    return {
        type: GET_PRODUCTS_BY_ARRIVAL,
        payload: request
    }

}

export function getProductsToShop(skip, limit, filters =[],previousState = []){
    const data = {
        skip,
        limit,
        filters
    }
    const request = axios.post(`${USER_SERVER}/newfeed`,data)
    .then(response =>{
        let newState = [
            ...previousState,
            ...response.data.topNewFeed
        ]
        return {
            size: response.data.size,
            posts: newState
        }
    })
    return {
        type: GET_PRODUCTS_TO_SHOP,
        payload: request
    }
}

export function getBrands(){
    const request = axios.get(`${PRODUCT_SERVER}/brands`)
        .then(response => response.data);
    return {
        type: GET_BRANDS,
        payload: request
    }
}

export function getWoods() {
    const request = axios.get(`${PRODUCT_SERVER}/woods`)
        .then(response => response.data);
    console.log(request)
    return {
        type: GET_WOODS,
        payload: request,
    }
}

export function createPost(dataToSubmit){

    const request = axios.post(`${POST_SERVER}/create_post`,dataToSubmit)
    .then(response => {
        return response.data
    });

    return{
        type: ADD_PRODUCT,
        payload: request
    }
}


export function updatePost(dataToSubmit,Actiontype) {
    const request = axios.post(`${POST_SERVER}/update_post`, dataToSubmit)
        .then(response => {
            return  response.data
        });
    return {
        type: Actiontype == "detail" ? UPDATE_POST_DETAIL : UPDATE_POST,
        payload: request
    }
}

export function clearProduct(){
    return{
        type: CLEAR_PRODUCT,
        payload: ''
    }
}

export function addBrands(dataToSubmit, existingBrands){
    const request = axios.post(`${PRODUCT_SERVER}/brand`,dataToSubmit)
    .then(response=>{
      let brands = [
          ...existingBrands,
          response.data.brand
      ];
      return{
          success: response.data.success,
          brands
      }  
    });

    return {
        type: ADD_BRAND,
        payload: request
    }
}

export function addWoods(dataToSubmit, existingWoods) {
    const request = axios.post(`${PRODUCT_SERVER}/wood`, dataToSubmit)
        .then(response => {
            let woods = [
                ...existingWoods,
                response.data.wood
            ];
            return {
                success: response.data.success,
                woods
            }
        });

    return {
        type: ADD_WOOD,
        payload: request
    }
}

export function getTopTenTags(skip, limit, previousState = []) {
    const data = {
        skip,
        limit
    };
    console.log(skip,limit)
    const request = axios.post(`${TAG_SERVER}/getTop10Tags`, data)
    .then(response => {
        let topTenTags = [
            ...previousState,
            ...response.data.topTenTags
        ]
        console.log(response.data.topTenTags)
        return {
            topTenTags,
            size: response.data.size
        };
    })
    return {
        type: GET_TOP10_TAGS,
        payload: request,
    }
}

export function likePost(postId,ActionType){
    const data ={
        postId
    }
    const request = axios.put(`${POST_SERVER}/like`,data)
    .then( response =>{
        console.log("Data", response.data[0]);
        return response.data[0];
    })
    return {
        type: ActionType == "detail" ? LIKE_DETAIL : LIKE_POST,
        payload: request,
    }
}

export function unlikePost(postId, ActionType) {
    const data = {
        postId
    }
    const request = axios.put(`${POST_SERVER}/unlike`, data)
        .then(response => {
            console.log(response.data[0]);
            return response.data[0];
    })
    return {
        type: ActionType == "detail" ? LIKE_DETAIL : LIKE_POST,
        payload: request,
    }
}

export function makeComment(postId, content, Actiontype) {

    const data = {
        postId,
        content
    }

    const request = axios.post(`${POST_SERVER}/comment`, data)
        .then(response => {
            console.log(response.data[0]);
            return response.data[0];
        })
    let action =  {
        type: Actiontype == "detail" ? UPDATE_DETAIL : COMMENT_POST,
        payload: request,
    }
    return action;
}

export function likeComment(postId,commentId,ActionType) {
    const data = {
        commentId,
        postId
    }
    const request = axios.put(`${POST_SERVER}/likeComment`, data)
        .then(response => {
            console.log(response.data[0]);
            return response.data[0];
        })
    return {
        type: LIKE_COMMENT,
        payload: request,
    }
}
export function unLikeComment(postId, commentId, ActionType) {
    const data = {
        commentId,
        postId
    }
    const request = axios.put(`${POST_SERVER}/unLikeComment`, data)
        .then(response => {
            console.log(response.data[0]);
            return response.data[0];
        })
    return {
        type: LIKE_COMMENT,
        payload: request,
    }
}

export function hidePost(postId, ActionType){
    const data = {
        postId,
    }
    const request = axios.put(`${POST_SERVER}/hidePost`, data)
    .then(response => {
        return response.data;
    })
    console.log(request)
    return {
        type: ActionType == "detail" ? HIDE_POST_DETAIL : HIDE_POST,
        payload: request,
    }
}

export function deleteComment(postId, commentId) {
    console.log(postId,commentId);
    const data = {
        postId,
        commentId
    }
    const request = axios.put(`${POST_SERVER}/deleteComment`, data)
    .then(response => {
        return response.data[0];
    })
    console.log(request)
    return {
        type: DELETE_COMMENT,
        payload: request,
    }
}

export function deletePost(postId) {
    const data = {
        postId
    }
    const request = axios.post(`${POST_SERVER}/delete_post`, data)
    .then(response => {
        return response.data;
    })
    console.log(request)
    return {
        type: DELETE_POST,
        payload: request,
    }
}

export function report(reportData, reportPolicy) {
    
    let data = {}
    reportData.reportType == "post" ? 
    data = {
        reportType: reportData.reportType,
        reportAbout: reportPolicy,
        post: reportData.post 
    }:
    data = {
        reportType: reportData.reportType,
        reportAbout: reportPolicy,
        comment: reportData.comment,
        post: reportData.post 
    } 

    const request = axios.post(`${POST_SERVER}/report`,data)
    .then(response =>{
        console.log(response.data);
        return response.data
    })
    
    return {
        type: REPORT_POST,
        payload: request,
    }
}

export function getStory(){

    const request = axios.get(`${STORY_SERVER}/getAll`)
        .then(response => {
            console.log(response.data);
            return response.data
        })

    return {
        type: GET_STORY,
        payload: request,
    }

}