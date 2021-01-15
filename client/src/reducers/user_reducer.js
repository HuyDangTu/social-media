import {
    LOGIN_USER,
    REGISTER_USER,
    AUTH_USER,
    LOGOUT_USER,
    ADD_TO_CART,
    STORE_REGISTER_INFO,
    GET_POST,
    GET_TYPE,
    UPDATE_IMG,
    UPDATE_PRO,
    FOLLOW_USER,
} from '../actions/types';

export default function(state={},action){
    switch(action.type){
        case LOGIN_USER: {
            return {...state, loginSuccess: action.payload}
        }
        case REGISTER_USER: {
            return { ...state, registerSuccess: action.payload }
        }
        case AUTH_USER: {
            return {...state,userData: action.payload}
        } 
        case LOGOUT_USER: {
            return { ...state}
        } 
        case ADD_TO_CART: {
            return { ...state,
                userData:{
                    ...state.userData,
                    cart: action.payload
            }}
        } 
        case STORE_REGISTER_INFO: {
            return {
                ...state,
                RegisterInfo: {
                    ... action.payload
                }
            }
        }
        case GET_POST: {
            return {
                ...state,
                postlist: action.payload.posts,
                userProfile: action.payload.userProfile
            }
        }
        case GET_TYPE:
            {
                return {
                    ...state,
                    typelist: action.payload
                }
            }
        case UPDATE_IMG:
            {
                return {
                    ...state,
                    img: action.payload
                }
            }
        case UPDATE_PRO:
            {
                return {
                    ...state,
                    userData: action.payload
                }
            } 
        case FOLLOW_USER:
            {
                return {
                    ...state,
                    userData: {
                        ...state.userData,
                        followings: action.payload
                    }
                }
            } 
        default: return state;
    }
}