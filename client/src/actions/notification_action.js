import axios from 'axios';
import { NOTIFY_SERVER } from '../components/ultils/mise';
import {
    GET_NOTIFICATION,
    NOTIFICATION_DETAIL,
    NOTIFICATION_SEENALL,
} from './types';
export function getNotification() {
    const request = axios.get(`${NOTIFY_SERVER}/getall`)
        .then(response => response.data);
    return {
        type: GET_NOTIFICATION,
        payload: request,
    }
}
export function seenNotification(id){
    const request = axios.post(`${NOTIFY_SERVER}/seen/${id}`)
    .then(response => response.data);
    return{
        type: NOTIFICATION_DETAIL,
        payload:request
    }
}
export function seenAllNotification(){
    const request = axios.post(`${NOTIFY_SERVER}/seenall`)
    .then(response=>response.data);
    return {
        type: NOTIFICATION_SEENALL,
        payload: request,
    }
}

export function disablenotification(id){
    const request = axios.post(`${NOTIFY_SERVER}/disable/${id}`)
    .then(response => response.data);
    return{
        type: NOTIFICATION_DETAIL,
        payload:request
    }
}



