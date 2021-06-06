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
    CHANGE_PRO,
    CHANGE_IMG, 
    SAVE_DETAIL,
    SAVE_POST,
    GET_HIGHLIGHT_STORY,
    GET_ALL_STORY,
    CREATE_HIGHLIGHT_STORY,
    DELETE_HIGHLIGHT_STORY,
    EDIT_HIGHLIGHT_STORY,
    GET_RECOMMEND_POST,
    GET_BLOCKED_USERS,
    UNBLOCKED_USERS,
    BLOCK_USER,
    RESTRICTED,
    GET_NATIONALITY,
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
        case CHANGE_PRO:
            {
                return {
                    ...state,
                    updateInfo: action.payload
                }
            }
        case SAVE_POST: {
            return {
                ...state,
                userData: {
                    ...state.userData,
                    saved: action.payload.saved
                }
            }
        }
        case CHANGE_IMG:
        {
            return {
                ...state,
                updateimginfo: action.payload
            }
        }
        case GET_HIGHLIGHT_STORY:{
            return {
                ...state,
                highlightStory: action.payload
            }
        }
        case GET_ALL_STORY:{
            return {
                ...state,
                storylist: action.payload
            }
        }
        case CREATE_HIGHLIGHT_STORY:{
            if(action.payload.success)
            {
                return {
                    ...state,
                    highlightStory: [...state.highlightStory,
                    action.payload.highlightStory[0]]
                }
            }else{
                return state
            }
        }
        case DELETE_HIGHLIGHT_STORY:{
            let updatedHighlightStory = [...state.highlightStory]
        
            updatedHighlightStory = updatedHighlightStory.filter(item =>
                item._id !== action.payload.storyId
            );
            console.log("data", updatedHighlightStory);
            return {
                ...state,
                highlightStory: updatedHighlightStory
            }
        }
        case EDIT_HIGHLIGHT_STORY:{
            let updatedHighlightStory = [...state.highlightStory]
            updatedHighlightStory = updatedHighlightStory.map(item => {
                if (item._id == action.payload.highlightStory[0]._id) {
                    return action.payload.highlightStory[0]
                } else {
                    return item
                }
            })
            return {
                ...state,
                highlightStory: updatedHighlightStory
            }
        }
        case GET_RECOMMEND_POST:{
            return {...state, 
                recommendedPost: action.payload.posts,
                recommendedPostSize: action.payload.size
            }
        }
        case GET_BLOCKED_USERS:{
            return {...state,
                blockedUsers: action.payload
            }
        }
        case BLOCK_USER:{

            let updatedBlockedUsers = [...state.userData.blockedUsers, action.payload.userId]

            return {
                ...state,
                userData:{
                    ...state.userData,
                    blockedUsers: updatedBlockedUsers
                }
            }
        }
        case UNBLOCKED_USERS: {
            let updatedBlockedUsers = [...state.userData.blockedUsers]
            console.log("data", updatedBlockedUsers);
            console.log("data", action.payload);
            updatedBlockedUsers = updatedBlockedUsers.filter(item =>
                item != action.payload.userId
            );
            console.log("data", updatedBlockedUsers);
            return {
                ...state,
                userData:{
                    ...state.userData,
                    blockedUsers: updatedBlockedUsers
                }
            }
        }
        case RESTRICTED:{
            return {
                ...state,
                restricted: true
            }
        }
        case GET_NATIONALITY:{
            return {
                ...state,
                nationality: action.payload
            }
        }
        default: return state;
    }
}