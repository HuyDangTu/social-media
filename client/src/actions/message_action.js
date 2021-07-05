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
    const request = axios.get(`https://myreactsocialnetwork.herokuapp.com/api/messages/get/${id}`)
        .then(response => response.data);

    return {
        type: GET_MESS,
        payload: request,
    }
}

export function getConversation(){
    const request = axios.get(`https://myreactsocialnetwork.herokuapp.com/api/messages/conversations`)
    .then(response=> response.data);
    return{
        type: GET_CONVERSATION,
        payload:request,
    }
}
export function sendMessage(datatoSubmit){
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/save`,datatoSubmit)
    .then(response=>response.data);
    return{
        type: SEND_MESS,
        payload:request
    }
}

export function replyStory(datatoSubmit){
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/replyStory`,datatoSubmit)
    .then(response=>response.data);
    return request
}

export function seenMessage(id) {
    const request = axios.get(`https://myreactsocialnetwork.herokuapp.com/api/messages/seen/${id}`)
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
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/uploadimage`, formData, config)
        .then(response => response.data);
    return {
        type: UPLOAD_IMG,
        payload: request
    }
}

export function getGroupMessage(id) {
    const request = axios.get(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/get/${id}`)
        .then(response => response.data);
    return {
        type: GET_GROUPMESS,
        payload: request,
    }
}

export function getGroup() {
    const request = axios.get(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/find`)
    .then(response=> response.data);
    return {
        type: GET_GROUP,
        payload: request
    }
}

export function sendGroupMessage(datatoSubmit){
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/save`,datatoSubmit)
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
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/create`,{"user":userlist},config)
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
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/edittitle/${id}`,{"title":title},config)
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
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/addmember/${id}`,{"user":userlist,"userid":userlistid},config)
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
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/remove/${id}`,{"uid":uid},config)
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
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/updatepic`, {"id":id,"url":url},config)
        .then(response => response.data)
    return {
        type: CHANGE_GROUPIMG,
        payload: request
    }
}

export function findPersonal(id) {
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/person/find/${id}`)
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
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/users/uploadimage`, formData, config)
        .then(response => response.data);
    return {
        type: UPLOAD_GROUPIMG,
        payload: request
    }
}

export function seenGroupMess(id){
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/seen/${id}`)
    .then(response=>response.data);
    return{
        type: SEEN_GROUP,
        payload:request
}
}

export function disableGroupMess(id){
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/disable/${id}`)
    .then(response=>response.data);
    return{
        type: SEEN_GROUP,
        payload:request
}
}

export function seenAll(){
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/messages/group/seenall`)
    .then(response=>response.data);
    return{
        type: SEEN_GROUP,
        payload:request
}
}
