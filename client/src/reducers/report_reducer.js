import {
    DELETE_POST,
    GET_ALL_REPORTS,
    GET_REPORT_DETAIL,
    UPDATE_REPORT,
    CLEAR
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
            const newDetail = {
                ...state.reportDetail,
                status: action.payload.report.status
            }
            return {
                reportDetail: newDetail
            }
        }
        case DELETE_POST: {
            const newDetail = {
                ...state.reportDetail,
                status: action.payload.success
            }
            return {
                reportDetail: newDetail
            }
        }
        case CLEAR: {
            return {}
        }
        default: return state;
    }
}