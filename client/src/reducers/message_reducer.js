
import {
  GET_CONVERSATION ,
  GET_MESS,
  SEND_MESS,
  SEEN_MESS,
  UPLOAD_IMG
} from '../actions/types';

export default function(state={},action){
    switch(action.type){
        case GET_MESS: {
            return {...state, messlist: action.payload}
        }
        case GET_CONVERSATION: {
            return {...state, conlist: action.payload}
        }
        case SEND_MESS:{
            let newmesslist= {...state.messlist}
            newmesslist.lastMess = action.payload.lastMess
            newmesslist.seenBy =[...action.payload.seenBy]
            newmesslist.messagelist = [...newmesslist.messagelist,action.payload.messagelist[action.payload.messagelist.length-1]]
            return {...state, messlist: newmesslist}
        }
        case SEEN_MESS:{
            return {...state, seenstatus: action.payload}
        }
        case UPLOAD_IMG:{
            return {...state,sendimg:action.payload}
        }
        default: return state;
    }
}