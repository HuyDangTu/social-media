import axios from 'axios';
import { ACCOUNT_SERVER,  } from '../components/ultils/mise';
import {
    GET_ALL_ACCOUNT,
    SORT_ACCOUNT,
    UPDATE_ACCOUNT,
    DELETE_ACCOUNT,
    GET_ACCOUNT,
} from './types';


export function getAll(limit, skip, prevState = []) {
    const data = {
        skip,
        limit,
    }
    console.log(data);
    const request = axios.post(`${ACCOUNT_SERVER}/getAll`, data)
        .then(response => {
            console.log(response.data.accounts);
            let newState = [
                ...prevState,
                ...response.data.accounts
            ]
            return {
                size: response.data.size,
                accounts: newState
            }
        })
    return {
        type: GET_ALL_ACCOUNT,
        payload: request
    }
}

export function sort(sortBy, list) {
    switch (sortBy.type) {
        case "name":
            list.sort((a, b) => {
                if (a.name > b.name) {
                    console.log(a.name,b.name);
                    return 1 * sortBy.order
                } else {
                    console.log(a.name, b.name);
                    return -1 * sortBy.order
                }
            })
            console.log(list);
            return list;
        case "userName":
            list.sort((a, b) => {
                if (a.userName > b.userName) {
                    return 1 * sortBy.order
                } else {
                    return -1 * sortBy.order
                }
            })
            console.log(list);
            return list;
        case "email":
            console.log(sortBy);
            list.sort((a, b) => {
                if (a.email > b.email) {
                    return 1 * sortBy.order
                } else {
                    return -1 * sortBy.order
                }
            })
            console.log(list);
            return list;
        default: return list;
    }
}

// export function getReportDetail(id) {
//     const data = { id }
//     const request = axios.post(`${REPORT_SERVER}/getDetail`, data)
//         .then(response => {
//             console.log(response.data);
//             return response.data
//         })
//     return {
//         type: GET_REPORT_DETAIL,
//         payload: request
//     }
// }

// export function updateReport(id) {
//     const data = { id }
//     const request = axios.put(`${REPORT_SERVER}/updateReport`, data)
//         .then(response => {
//             console.log(response.data);
//             return response.data
//         })
//     return {
//         type: UPDATE_REPORT,
//         payload: request
//     }
// }

// export function deletePost(postId, reportId) {
//     const data = { postId, reportId }
//     const request = axios.post(`${REPORT_SERVER}/delete_post`, data)
//         .then(response => {
//             console.log(response.data);
//             return response.data
//         })
//     return {
//         type: UPDATE_REPORT,
//         payload: request
//     }
// }