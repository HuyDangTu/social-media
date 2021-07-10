import axios from 'axios';
import { NOTIFY_SERVER } from '../components/ultils/mise';
import {
    GET_NOTIFICATION,
    NOTIFICATION_DETAIL,
    NOTIFICATION_SEENALL,
} from './types';

export function getNotification() {
    const request = axios.get(`https://myreactsocialnetwork.herokuapp.com/api/notify/getall`)
        .then(response => response.data);
    return {
        type: GET_NOTIFICATION,
        payload: request,
    }
}

export function seenNotification(id){
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/notify/seen/${id}`)
    .then(response => response.data);
    return{
        type: NOTIFICATION_DETAIL,
        payload:request
    }
}
export function seenAllNotification(){
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/notify/seenall`)
    .then(response=>response.data);
    return {
        type: NOTIFICATION_SEENALL,
        payload: request,
    }
}


export function disablenotification(id){
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/disable/${id}`)
    .then(response => response.data);
    return{
        type: NOTIFICATION_DETAIL,
        payload:request
    }
}