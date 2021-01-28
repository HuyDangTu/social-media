import axios from 'axios';
import { REPORT_SERVER,POST_SERVER } from '../components/ultils/mise';
import {
    GET_ALL_REPORTS,
    SORT_REPORT,
    UPDATE_REPORT,
    DELETE_POST_REPORT,
    GET_REPORT_DETAIL,
    CLEAR
} from './types';


export function getAll(limit, skip, filter, prevState = []) {
    const data = {
        skip,
        limit,
        filter,
    }
    console.log(data);
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/reports/getAll`, data)
    .then(response => {
        console.log(response.data.reports)
        let newState = [
            ...prevState,
            ...response.data.reports
        ]
        console.log(response.data.reports);
        return {
            size: response.data.size,
            reports: newState
        }
    })
    return {
        type: GET_ALL_REPORTS,
        payload: request
    }
}

export function sort(sortBy, list){
   switch(sortBy.type){
        case "date": 
            list.sort((a,b)=>{
                if (a.dateDifference > b.dateDifference){
                    return 1 * sortBy.order
                }else if (a.dateDifference == b.dateDifference){
                    return 0
                }
                else {
                    return -1 * sortBy.order
                }
            })
            console.log(list);
            return list;
        case "status": 
           console.log(sortBy);
           list.sort((x, y) => {
               return (x.status === y.status) ? 0 : x.status ? -1 * sortBy.order : 1 * sortBy.order;
           })
           console.log(list);
           return list;
        case "reportType": 
           console.log(sortBy);
           list.sort((a, b) => {
               if (a.reportType > b.reportType) {
                   return 1 * sortBy.order
               } else {
                   return -1 * sortBy.order
               }
           })
           console.log(list);
           return list;
   }
}

export function getReportDetail(id) {
    const data={id}
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/reports/getDetail`, data)
        .then(response => {
            console.log(response.data);
            return response.data
        })
    return {
        type: GET_REPORT_DETAIL,
        payload: request
    }
}

export function clearDetail(){
    const request = {}
    return {
        type: CLEAR,
        payload: request,
    }
}


export function updateReport(id){
    const data = { id }
    const request = axios.put(`https://myreactsocialnetwork.herokuapp.com/api/reports/updateReport`, data)
        .then(response => {
            console.log(response.data);
            return response.data
        })
    return {
        type: UPDATE_REPORT,
        payload: request
    }
}

export function deletePost(postId,reportId){
    const data = { postId, reportId }
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/reports/delete_post`, data)
        .then(response => {
            console.log(response.data);
            return response.data
        })
    return {
        type: UPDATE_REPORT,
        payload: request
    }
}

export function deleteComment(commentId, reportId) {
    const data = { commentId, reportId }
    const request = axios.post(`https://myreactsocialnetwork.herokuapp.com/api/reports/delete_comment`, data)
        .then(response => {
            console.log(response.data);
            return response.data
        })
    return {
        type: UPDATE_REPORT,
        payload: request
    }
}