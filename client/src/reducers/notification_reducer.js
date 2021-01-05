import {
    GET_NOTIFICATION,
    NOTIFICATION_DETAIL,
    NOTIFICATION_SEENALL
  } from '../actions/types';
  export default function(state={},action){
      switch(action.type){
          case GET_NOTIFICATION: {
              return {...state, notifylist: action.payload}
          }
          case NOTIFICATION_DETAIL:{
              return {...state, notifydetail: action.payload}
          }
          case NOTIFICATION_SEENALL:{
              return {...state, seenstatus: action.payload}
          }
          default: return state;
      }
  }