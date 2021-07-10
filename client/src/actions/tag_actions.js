import axios from 'axios';
import { TAG_SERVER } from '../components/ultils/mise';

import {
    GET_ALL_TAGS,
    GET_TOP10_TAGS,
    ADD_TAG,
    GET_USER_TAG, 
    GET_TAG_POSTS,
    FOLLOW_TAG,
    UN_FOLLOW_TAG,
} from './types';

export function getAllTags() {
    const request = axios.get(`https://myreactsocialnetwork.herokuapp.com/api/tags/getAllTags`)
    .then(response => response.data)
    return {
        type: GET_ALL_TAGS,
        payload: request,
    }
}

export function getUserTag() {
    const request = axios.get(`https://myreactsocialnetwork.herokuapp.com/api/tags/getFollowers`)
        .then(response => response.data)
    return {
        type: GET_USER_TAG,
        payload: request,
    }
}

export function getTopTenTags(skip,limit,previousState=[]) {
    const data={
        skip,
        limit
    };
    const request = axios.get(`https://myreactsocialnetwork.herokuapp.com/api/tags/getTop10Tags`, data)
    .then(response => {
        let newState = [
            ...previousState,
            ...response.data.topTenTags
        ]
        return  newState;
    })
    return {
        type: GET_TOP10_TAGS,
        payload: request,
    }
}
export function addTag(dataToSubmit, existingTag) {
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/tags/addTag`, dataToSubmit)
        .then(response => {
            let tags = [
                ...existingTag,
                response.data.tags
            ];
            return {
                success: response.data.success,
                tags
            }
        });

    return {
        type: ADD_TAG,
        payload: request
    }
}
export function getTag(id,skip, limit, previousState = []){
    const data = {
        id,
        skip,
        limit,
    }
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/tags/getTag`, data)
        .then(response => {
            console.log(response.data);
            let newState = {
                tag: response.data.tag,
                posts: [...previousState,...response.data.posts]
            }
            return newState
        })
    return {
        type: GET_TAG_POSTS,
        payload: request
    }
}

export function followTag(tagId, previousState=[]) {
    
    const data = { tagId }
    
    const request = axios.put(`https://myreactsocialnetwork.herokuapp.com/api/tags/follow`, data)
    .then( response => {
        console.log(response.data);
        return {
            ...previousState,
            tag: response.data.tag,
        }
    })
    
    return {
        type: FOLLOW_TAG,
        payload: request
    }

}

export function unfollowTag(tagId, previousState = []){

    const data = { tagId }

    const request = axios.put(`https://myreactsocialnetwork.herokuapp.com/api/tags/unfollow`, data)
        .then(response => {
            console.log(response.data);
            return {
                ...previousState,
                tag: response.data.tag,
            }
        })

    return {
        type: FOLLOW_TAG,
        payload: request
    }

}


export function getTagId(hashtag) {
    console.log(hashtag)
    const data = {hashtag}
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/tags/getTagId`, data)
        .then(response => {
            console.log(response.data);
            return response.data
        })
    return request;
}
