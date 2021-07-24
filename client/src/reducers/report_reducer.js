import { LetterB } from 'tabler-icons-react';
import {
    GET_ALL_REPORTS,
    GET_REPORT_DETAIL,
    UPDATE_REPORT,
    RESTRICT_USER,
    CLEAR,
    DELETE_RESTRICTED_FUNCTION,
    DELETE_REPORT_POST,
    DELETE_REPORT_COMMENT
} from '../actions/types';

export default function (state = {}, action) {
    switch (action.type) {
        case GET_ALL_REPORTS: {
            return {
                ...state,
                list: action.payload.reports,
                size: action.payload.size,
            }
        }
        case GET_REPORT_DETAIL:{
            return {
                reportDetail: action.payload.reportDetail
            }
        }
        case UPDATE_REPORT: {
            // if(action.payload.report.reportType == "user" ){
            //     let newUserInfo = {
            //         ...state.reportDetail.userId[0]
            //     }
            //     console.log(newUserInfo)
            //     newUserInfo.restrictedFunctions = action.payload.restrictedFunctions
            //     console.log(newUserInfo)
            //     return {
            //         reportDetail: {
            //             ...state.reportDetail,
            //             status: action.payload.report.status,
            //             userId: [newUserInfo]
            //         }
            //     }
            // }else {
               
            // }
            const newDetail = {
                ...state.reportDetail,
                status: action.payload.report.status
            }
            return {
                reportDetail: newDetail
            }
        }
        case RESTRICT_USER:{
            let newUserInfo = {
                ...state.reportDetail.userId[0]
            }
            console.log(newUserInfo)
            newUserInfo.restrictedFunctions = action.payload.restrictedFunctions
            console.log(newUserInfo)
            return {
                reportDetail: {
                    ...state.reportDetail,
                    status: action.payload.report.status,
                    userId: [newUserInfo]
                }
            }
        }
        case DELETE_REPORT_POST: {
            const newDetail = {
                ...state.reportDetail,
                status: action.payload.report.status
            }
            return {
                reportDetail: newDetail
            }
        }
        case DELETE_REPORT_COMMENT: {
            const newDetail = {
                ...state.reportDetail,
                status: action.payload.report.status
            }
            return {
                reportDetail: newDetail
            }
        }
        case DELETE_RESTRICTED_FUNCTION:{
            let newUserInfo = {
                ...state.reportDetail.userId[0]
            }
            console.log(newUserInfo)
            newUserInfo.restrictedFunctions = newUserInfo.restrictedFunctions.filter(item =>
                item._id != action.payload.funcId) 
            console.log(newUserInfo)
            return {
                reportDetail: {
                    ...state.reportDetail,
                    userId: [newUserInfo]
                }
            }
        }
        case CLEAR: {
            return {}
        }
        default: return state;
    }
}