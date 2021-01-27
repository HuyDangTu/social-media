import axios from 'axios';
import {USER_SERVER} from '../components/ultils/mise';
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
    CHANGE_IMG
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
    const request = axios.post(`https://dashboard.heroku.com/login`,dataToSubmit)
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
                posts: response.data.posts
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
    const request = axios.post('/api/users/uploadimage', formData, config)
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
    const request = axios.put('/api/users/updatepic', config)
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
