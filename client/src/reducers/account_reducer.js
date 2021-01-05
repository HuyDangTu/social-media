import {
    GET_ALL_ACCOUNT,
    SORT_ACCOUNT,
    UPDATE_ACCOUNT,
    DELETE_ACCOUNT,
    GET_ACCOUNT,
} from '../actions/types';

export default function (state = {}, action) {
    switch (action.type) {
        case GET_ALL_ACCOUNT: {
            return {
                ...state,
                list: action.payload.reports,
                size: action.payload.size,
            }
        }
        case SORT_ACCOUNT: {
            return {
                reportDetail: action.payload.reportDetail
            }
        }
        case UPDATE_ACCOUNT: {
            const newDetail = {
                ...state.reportDetail,
                status: action.payload.status
            }
            return {
                reportDetail: newDetail
            }
        }
        case GET_ACCOUNT: {
            const newDetail = {
                ...state.reportDetail,
                status: action.payload.success
            }
            return {
                reportDetail: newDetail
            }
        }
        default: return state;
    }
}