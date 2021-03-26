import axios from 'axios';
import Pusher from 'pusher-js';
import { MESS_SERVER } from '../components/ultils/mise';
import {
    GET_CONVERSATION,
    GET_MESS,
    SEND_MESS,
    SEEN_MESS,
    UPLOAD_IMG
} from './types';
export function getMessage(id) {
    const request = axios.get(`${MESS_SERVER}/get/${id}`)
        .then(response => response.data);

    return {
        type: GET_MESS,
        payload: request,
    }
}

export function getConversation(){
    const request = axios.get(`${MESS_SERVER}/conversations`)
    .then(response=> response.data);
    return{
        type: GET_CONVERSATION,
        payload:request,
    }
}
export function sendMessage(datatoSubmit){
    const request = axios.post(`${MESS_SERVER}/save`,datatoSubmit)
    .then(response=>response.data);
    return{
        type: SEND_MESS,
        payload:request
    }
}
export function seenMessage(id) {
    const request = axios.get(`${MESS_SERVER}/seen/${id}`)
        .then(response => response.data);
    return {
        type: SEEN_MESS,
        payload: request,
    }
}
export function sendimg(file) {
    let formData = new FormData();
    const config = {
        header: { 'content-type': 'multipart/form-data' }
    }
    formData.append("file", file)
    const request = axios.post(`${MESS_SERVER}/uploadimage`, formData, config)
        .then(response => response.data);
    return {
        type: UPLOAD_IMG,
        payload: request
    }
}