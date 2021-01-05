import {
    GET_POLICY
} from '../actions/types';


export default function (state = {}, action) {
    switch (action.type) {
        case GET_POLICY: {
            return { ...state, policyList: action.payload}
        }
        default: return state;
    }
}