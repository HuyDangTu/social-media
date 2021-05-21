import axios from 'axios';
import {USER_SERVER} from '../components/ultils/mise';
import {STORY_SERVER} from '../components/ultils/mise';

import {
    LOGIN_USER,
    REGISTER_USER,
    AUTH_USER,
    LOGOUT_USER,
    ADD_TO_CART,
    STORE_REGISTER_INFO,
    GET_POST,
    UPDATE_IMG,
    UPDATE_PRO,
    GET_TYPE,
    FOLLOW_USER,
    CHANGE_PRO,
    CHANGE_IMG,
    GET_HIGHLIGHT_STORY,
    GET_ALL_STORY,
    CREATE_HIGHLIGHT_STORY,
    DELETE_HIGHLIGHT_STORY,
    EDIT_HIGHLIGHT_STORY,
    GET_RECOMMEND_POST,
    BLOCK_USER,
    GET_BLOCKED_USERS,
    UNBLOCKED_USERS,
    } from './types';

export function registerUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/register`,dataToSubmit)
    .then(response => response.data);
    return {
        type: REGISTER_USER,
        payload: request,
    }
}

export function loginUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}login`,dataToSubmit)
    .then(response => response.data);
    console.log(request);
    return{
        type: LOGIN_USER,
        payload: request
    };
}

export function loginAdmin(dataToSubmit) {
    const request = axios.post(`${USER_SERVER}/loginAdmin`, dataToSubmit)
        .then(response => response.data);
    console.log(request);
    return {
        type: LOGIN_USER,
        payload: request
    };
}



export function loginByFaceGoogle(email) {
    let data = {email}
    const request = axios.post(`${USER_SERVER}/loginByFaceGoogle`, data)
        .then(response => response.data);
    console.log(request);
    return {
        type: LOGIN_USER,
        payload: request
    };
}

export function storeInfoForRegister(data) {
    return {
        type: STORE_REGISTER_INFO,
        payload: data
    };
}

export function auth(){
    const request = axios.get(`${USER_SERVER}/auth`)
    .then(response => response.data);

    return {
        type: AUTH_USER,
        payload: request,
    }
}

export function logoutUser() {
    const request = axios.get(`${USER_SERVER}/logout`)
        .then(response => response.data);

    return {
        type: LOGOUT_USER,
        payload: request,
    }
}

export function addToCart(_id){
    const request = axios.post(`${USER_SERVER}/addToCart?productId=${_id}`)
    .then(response => response.data);
    return  {
        type: ADD_TO_CART,
        payload: request
    }
}

export function searchUser(keyword) {
    let data = { keyword }
    const request = axios.post(`${USER_SERVER}/search`,data)
        .then(response => response.data);
    return request
}

export function findProfile(_id) {
    const request = axios.get(`${USER_SERVER}/${_id}`)
        .then(response => {
            return {
                userProfile: response.data.user,
                posts: response.data.posts,
                NotFound: response.data.NotFound,
            }
        });

    return {
        type: GET_POST,
        payload: request
    }
}
export function findTagged(id) {
    const request = axios.get(`${USER_SERVER}/tagged/${id}`)
        .then(response => response.data.posts)
    return {
        type: GET_TYPE,
        payload: request
    }
}

export function findPosted(id) {
    const request = axios.get(`${USER_SERVER}/posted/${id}`)
        .then(response => response.data.posts)
    return {
        type: GET_TYPE,
        payload: request
    }
}

export function follow(followId) {
    const request = axios.put(`${USER_SERVER}/follow/${followId}`)
        .then(response => response.data.followings);
    return {
        type: FOLLOW_USER,
        payload: request
    }
}

export function unfollow(unfollowId) {
    const request = axios.put(`${USER_SERVER}/unfollow/${unfollowId}`)
        .then(response => response.data.followings);
    return {
        type: FOLLOW_USER,
        payload: request
    }
}

export function updateprofileimgfile(file) {
    let formData = new FormData();
    const config = {
        header: { 'content-type': 'multipart/form-data' }
    }
    formData.append("file", file)
    const request = axios.post('${USER_SERVER}/uploadimage', formData, config)
        .then(response => response.data);
    return {
        type: UPDATE_IMG,
        payload: request
    }
}

export function changeProfile(id, dataToSubmit) {
    const request = axios.put(`${USER_SERVER}/update/${id}`, dataToSubmit)
        .then(response => response.data);
    console.log(request);
    return {
        type: CHANGE_PRO,
        payload: request
    }
}

export function updateprofileimg(url) {
    const config =
    {
        url
    }
    const request = axios.put('${USER_SERVER}/updatepic', config)
        .then(response => response.data)
    return {
        type: CHANGE_IMG,
        payload: request
    }
}

export function updateprofile(id) {
    const request = axios.get(`${USER_SERVER}/profile/${id}`)
        .then(response => response.data)
    return {
        type: UPDATE_PRO,
        payload: request
    }
}

export function changePassword(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/changePassword`, dataToSubmit)
        .then(response => response.data)
    return {
        type: UPDATE_PRO,
        payload: request
    }
}

export function findSaved(id) {
    const request = axios.post(`${USER_SERVER}/getSavedPost`)
        .then(response => { console.log(response.data.posts); return response.data.posts})
    return {
        type: GET_TYPE,
        payload: request
    }
}

export function getHighLightStory(id){
    const request = axios.get(`${STORY_SERVER}/getHighlightStory/${id}`)
    .then(response =>{
        console.log(response)
        return response.data
    })
    return {
        type: GET_HIGHLIGHT_STORY, 
        payload: request
    }
}

export function createHighLightStory(dataToSubmit){
    const request = axios.post(`${STORY_SERVER}/createHighlightStory`,dataToSubmit)
    .then(response =>{
        console.log(response)
        return response.data
    })
    return {
        type: CREATE_HIGHLIGHT_STORY, 
        payload: request
    }
}

export function getAllStories(){
    const request = axios.get(`${STORY_SERVER}/getAllStories`)
    .then(response =>{
        return response.data
    })

    return {
        type: GET_ALL_STORY,
        payload: request
    }
}

export function deleteHighLightStory(storyId){
    const data = {storyId}
    const request = axios.post(`${STORY_SERVER}/deleteHighLightStory`,data)
    .then(response =>{
        return response.data
    })
    return {
        type: DELETE_HIGHLIGHT_STORY,
        payload: request
    }
}

export function editHighLightStory(dataToSubmit){
   
    const request = axios.post(`${STORY_SERVER}/editHighLightStory`,dataToSubmit)
    .then(response =>{
        return response.data
    })
    return {
        type: EDIT_HIGHLIGHT_STORY,
        payload: request
    }
}

export function getRecommendPost(limit,skip, previousState = []){
    const data={limit,skip}
    const request = axios.post(`${USER_SERVER}/getRecommendPost`,data)
        .then(response => {
            let newState = [
                ...previousState,
                ...response.data.posts
            ]
            return {
                size: response.data.size,
                posts: newState
            }
        })
    return {
        type: GET_RECOMMEND_POST,
        payload: request,
    }
}

export function blockUser(id){

    const request = axios.put(`${USER_SERVER}/block/${id}`)
        .then(response => {
            return response.data
        })
    return {
        type: BLOCK_USER,
        payload: request
    }
}

export function unBlockUser(id){

    const request = axios.put(`${USER_SERVER}/unblock/${id}`)
        .then(response => {
            return response.data
        })
    return {
        type: UNBLOCKED_USERS,
        payload: request
    }
}


export function getBlockedUsers(){

    const request = axios.get(`${USER_SERVER}/blockedUsers`)
    .then(response =>{
        return response.data
    })
    return {
        type: GET_BLOCKED_USERS,
        payload: request
    }
} 
