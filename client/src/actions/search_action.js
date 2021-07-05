import axios from 'axios';
import { USER_SERVER } from '../components/ultils/mise';
import {
    SEARCH_RESULT,
    LOAD_MORE_TAG,
    LOAD_MORE_USER
} from './types';

export function search(keyword,skip,limit,prevState=[]) {
    console.log(keyword, skip, limit, prevState );
    if(keyword==""){
        return {
            type: SEARCH_RESULT,
            payload: {
                users: [],
                tags: [],
            }
        }
    }
    else{
        console.log(prevState);
        let data = { keyword,skip, limit }
        const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/users/search`, data)
            .then(response => {
                let newUsers = [
                    ...prevState.users,
                    ...response.data.users
                ]
                let newTags = [
                    ...prevState.tags, 
                    ...response.data.tags
                ]
                return { 
                    users: newUsers,
                    tags: newTags,
                    userSize: response.data.users.length,
                    tagSize: response.data.tags.length,
                }
            });

        return {
            type: SEARCH_RESULT,
            payload: request
        }
    }
}

export function searchmess(keyword,skip,limit,prevState=[]) {
    console.log(keyword, skip, limit, prevState );
    if(keyword==""){
        return {
            type: SEARCH_RESULT,
            payload: {
                users: [],
                tags: [],
            }
        }
    }
    else{
        console.log(prevState);
        let data = { keyword,skip, limit }
        const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/users/searchmess`, data)
            .then(response => {
                let newUsers = [
                    ...prevState.users,
                    ...response.data.users
                ]
                let newGroups = [
                    ...prevState.groups, 
                    ...response.data.groups
                ]
                return { 
                    users: newUsers,
                    groups: newGroups,
                    userSize: response.data.users.length,
                    tagSize: response.data.groups.length,
                }
            });

        return {
            type: SEARCH_RESULT,
            payload: request
        }
    }
}


export function loadmoreUser(keyword, skip, limit, prevState = []) {
    console.log(keyword, skip, limit, prevState);
    if (keyword == "") {
        return {
            type: LOAD_MORE_USER,
            payload: {
                users: [],
                userSize: 0,
                tagSize: 0,
                tags: [],
            }
        }
    }
    else {
        console.log(prevState);
        let data = { keyword, skip, limit }
        const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/users/searchUser`, data)
            .then(response => {
                let newUsers = [
                    ...prevState.users,
                    ...response.data.users
                ]
                return {
                    users: newUsers,
                    userSize: response.data.users.length,
                }
            });

        return {
            type: LOAD_MORE_USER,
            payload: request
        }
    }
}

export function loadmoreTag(keyword, skip, limit, prevState = []) {

    console.log(keyword, skip, limit, prevState);
    if (keyword == "") {
        return {
            type: LOAD_MORE_TAG,
            payload: {
                users: [],
                userSize: 0,
                tagSize: 0,
                tags: [],
            }
        }
    }
    else {
        console.log(prevState);
        let data = { keyword, skip, limit }
        const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/users/searchTag`, data)
            .then(response => {
                console.log(response.data.tags)
                let newTags = [
                    ...prevState.tags,
                    ...response.data.tags
                ]
                return {
                    tags: newTags,
                    tagSize: response.data.tags.length,
                }
            });
        return {
            type: LOAD_MORE_TAG,
            payload: request
        }
    }
}


