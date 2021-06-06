import axios from 'axios';
import { STATISTICS_SERVER } from '../components/ultils/mise';

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
} from './types';

export function getGrowthOfUsers(year) {
    const request = axios.get(`${STATISTICS_SERVER}/growthOfUser?year=${year})`)
    .then(response => {
        console.log(response.data)
        return response.data
    })
    return {
        type: GET_GROWTH_OF_USER,
        payload: request,
    }
}

export function getPercentageOfAge(year) {
    const request = axios.get(`${STATISTICS_SERVER}/percentageOfAge?year=${year}`)
    .then(response => {
        console.log(response.data)
        return response.data
    })
    return {
        type: GET_PERCENTEAGE_OF_AGE,
        payload: request,
    }
}


export function unusedAccountSinceBeginOfThisYear() {
    const request = axios.get(`${STATISTICS_SERVER}/unusedAccountSinceBeginOfThisYear`)
    .then(response => {
        console.log(response.data)
        return response.data
    })
    return {
        type:  GET_UNUSED_USERS,
        payload: request,
    }
}

export function newPostThisMonth(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    console.log(month, year);
    const request = axios.get(`${STATISTICS_SERVER}/newPostThisMonth?year=${year}&month=${month}`)
    .then(response => {
        console.log(response.data)
        return response.data
    })
    return {
        type: GET_TOTAL_OF_NEW_POSTS,
        payload: request,
    }
}

export function newAccountThisMonth(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    console.log(month, year);
    const request = axios.get(`${STATISTICS_SERVER}/newAccountThisMonth?year=${year}&month=${month}`)
    .then(response => {
        console.log(response.data)
        return response.data
    })
    return {
        type: GET_NEW_USER,
        payload: request,
    }
}

export function numOfAccount(year) {
    // console.log(year.getFullYear())
    const request = axios.get(`${STATISTICS_SERVER}/numOfAccount?year=${year.getFullYear()}`)
    .then(response => {
        console.log(response.data)
        return response.data
    })
    return {
        type:  GET_NUM_OF_USERS,
        payload: request,
    }
}

export function getUserBehaviors(year){
    const request = axios.get(`${STATISTICS_SERVER}/userBehaviors?year=${year}`)
    .then(response => {
        console.log(response.data)
        return response.data
    })
    return {
        type:  GET_USERS_BEHAVIORS,
        payload: request,
    }
}

export function getUsersNationality(year){
    const request = axios.get(`${STATISTICS_SERVER}/userNationalities?year=${year}`)
    .then(response => {
        console.log(response.data)
        return response.data
    })
    return {
        type:  GET_USERS_NATIONALITIES,
        payload: request,
    }
}

export function getTop10Users(){
    const request = axios.get(`${STATISTICS_SERVER}/getTop10Users`)
    .then(response => {
        console.log(response.data)
        return response.data
    })
    return {
        type:  GET_TOP_TEN_USERS,
        payload: request,
    }
}



