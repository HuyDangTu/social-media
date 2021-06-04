import axios from 'axios';
import Pusher from 'pusher-js';
import { MESS_SERVER } from '../components/ultils/mise';
import { USER_SERVER } from '../components/ultils/mise';
import {
    GET_CONVERSATION,
    GET_MESS,
    SEND_MESS,
    SEEN_MESS,
    UPLOAD_IMG,
    DELETE_STORY,
    GET_GROUP,
    GET_GROUPMESS,
    SEND_GROUP_MESS,
    CREATE_GROUP,
    EDIT_TITLE,
    ADD_MEMBER,
    REMOVE_MEMBER,
    CHANGE_GROUPIMG,
    UPLOAD_GROUPIMG,
    SEEN_GROUP,
    FIND_PERSONAL,
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

export function replyStory(datatoSubmit){
    const request = axios.post(`${MESS_SERVER}/group/replyStory`,datatoSubmit)
    .then(response=>response.data);
    return request
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

export function getGroupMessage(id) {
    const request = axios.get(`${MESS_SERVER}/group/get/${id}`)
        .then(response => response.data);
    return {
        type: GET_GROUPMESS,
        payload: request,
    }
}

export function getGroup() {
    const request = axios.get(`${MESS_SERVER}/group/find`)
    .then(response=> response.data);
    return {
        type: GET_GROUP,
        payload: request
    }
}

export function sendGroupMessage(datatoSubmit){
    const request = axios.post(`${MESS_SERVER}/group/save`,datatoSubmit)
    .then(response=>response.data);
    return{
        type: SEND_GROUP_MESS,
        payload:request
    }
}

export function createGroup(userlist){ 
    const config = {
        "Content-Type": "application/json"
    }
    const request = axios.post(`${MESS_SERVER}/group/create`,{"user":userlist},config)
    .then(response=>response.data);
    return{
        type: CREATE_GROUP,
        payload:request
    }
}
export function editTitle(id,title){
  const config = {
        "Content-Type": "application/json"
    }
    const request = axios.post(`${MESS_SERVER}/group/edittitle/${id}`,{"title":title},config)
    .then(response=>response.data);
    return{
        type: EDIT_TITLE,
        payload:request
    }
}
export function addMember(id,userlist,userlistid)
{
    const config = {
        "Content-Type": "application/json"
    }
    const request = axios.post(`${MESS_SERVER}/group/addmember/${id}`,{"user":userlist,"userid":userlistid},config)
    .then(response=>response.data);
    return{
        type: ADD_MEMBER,
        payload:request
    }
}

export function removeMember(id,uid){
    const config = {
        "Content-Type": "application/json"
    }
    const request = axios.post(`${MESS_SERVER}/group/remove/${id}`,{"uid":uid},config)
    .then(response=>response.data);
    return{
        type: REMOVE_MEMBER,
        payload:request
    }
}

export function changegroupimg(id,url) {
    const config = {
        "Content-Type": "application/json"
    }
    const request = axios.post(`${MESS_SERVER}/group/updatepic`, {"id":id,"url":url},config)
        .then(response => response.data)
    return {
        type: CHANGE_GROUPIMG,
        payload: request
    }
}

export function findPersonal(id) {
    const request = axios.post(`${MESS_SERVER}/group/person/find/${id}`)
    .then(response=> response.data);
    return {
        type: FIND_PERSONAL,
        payload: request
    }
}

export function uploadgroupimg(file) {
    let formData = new FormData();
    const config = {
        header: { 'content-type': 'multipart/form-data' }
    }
    formData.append("file", file)
    const request = axios.post(`${USER_SERVER}/uploadimage`, formData, config)
        .then(response => response.data);
    return {
        type: UPLOAD_GROUPIMG,
        payload: request
    }
}

export function seenGroupMess(id){
    const request = axios.post(`${MESS_SERVER}/group/seen/${id}`)
    .then(response=>response.data);
    return{
        type: SEEN_GROUP,
        payload:request
}
}