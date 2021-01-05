import {
  SEARCH_RESULT,
    LOAD_MORE_TAG,
    LOAD_MORE_USER
} from '../actions/types';

export default function (state = {}, action) {
    switch (action.type) {
        case SEARCH_RESULT: {
            return {
                users: action.payload.users,
                tags: action.payload.tags,
                userSize: action.payload.userSize,
                tagSize: action.payload.tagSize
            }
        }
        case LOAD_MORE_USER: {
            return {
                ...state,
                users: action.payload.users,
                userSize: action.payload.userSize,
            }
        }
        case LOAD_MORE_TAG: {
            return {
                ...state,
                tags: action.payload.tags,
                tagSize: action.payload.tagSize
            }
        }
        default: return state;
    }
}