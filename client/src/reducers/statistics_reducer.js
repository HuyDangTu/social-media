import {
    GET_GROWTH_OF_USER,
    GET_PERCENTEAGE_OF_AGE,
    GET_NUM_OF_USERS,
    GET_UNUSED_USERS,
    GET_NEW_USER,
    GET_TOTAL_OF_NEW_POSTS,
    GET_TOP_TEN_USERS,
    GET_USERS_BEHAVIORS,
    GET_USERS_NATIONALITIES,
} from '../actions/types';

export default function (state = {}, action) {
    switch (action.type) {
       
        case GET_GROWTH_OF_USER: {
            return { ...state, growthOfUsers: action.payload }
        }
        case GET_PERCENTEAGE_OF_AGE: {
            return { ...state, percentageOfAge: action.payload }
        }
        case GET_UNUSED_USERS: {
            return { ...state, unusedUsers: action.payload }
        }
        case GET_NEW_USER: {
            return { ...state, newUsers: action.payload }
        }
        case GET_NUM_OF_USERS: {
            return { ...state, sumOfUsers: action.payload }
        }
        case GET_TOTAL_OF_NEW_POSTS:{
            return { ...state, totalOfNewPost: action.payload}
        }
        case GET_TOP_TEN_USERS:{
            return {...state, top10Users: action.payload}
        }
        case GET_USERS_BEHAVIORS: {
            return {...state, userBehaviors: action.payload}
        }
        case GET_USERS_NATIONALITIES: {
            return {...state, usersNationalities: action.payload }
        }
        default: return state;
    }
}