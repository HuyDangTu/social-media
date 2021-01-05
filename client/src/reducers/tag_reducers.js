import {
    GET_TOP10_TAGS,
    GET_ALL_TAGS,
    ADD_TAG,
    GET_USER_TAG,
    GET_TAG_POSTS,
    FOLLOW_TAG
} from '../actions/types';

export default function (state = {}, action) {
    switch (action.type) {
       
        case GET_ALL_TAGS: {
            return { ...state, allTags: action.payload }
        }
        case ADD_TAG: {
            return {
                ...state,
                addTag: action.payload
            }
        }
        case GET_USER_TAG: {
            return {
                ...state,
                userTags: action.payload
            }
        }

        case GET_TAG_POSTS: {
            return {
                ...state,
                tag: action.payload        
            }
        }

        case FOLLOW_TAG: {
            return {
                ...state,
                tag: action.payload
            }
        }

        default: return state;
    }
}