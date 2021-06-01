
import {
  GET_CONVERSATION ,
  GET_MESS,
  SEND_MESS,
  SEEN_MESS,
  UPLOAD_IMG,
  DELETE_STORY,
  GET_GROUP,
    GET_GROUPMESS,
    SEND_GROUP_MESS,
    CREATE_GROUP,
    EDIT_TITLE,
    ADD_MEMBER,
    REMOVE_MEMBER,
    CHANGE_GROUPIMG,
    UPLOAD_GROUPIMG,
    SEEN_GROUP,
    FIND_PERSONAL,
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
        case GET_GROUP:{
            return {...state,grouplist:action.payload}
        }
        case GET_GROUPMESS:{
            return {...state,groupmesslist:action.payload}
        }
        case SEND_GROUP_MESS:{
            let newgroupmesslist= {...state.groupmesslist}
            newgroupmesslist.lastMess = action.payload.lastMess
            newgroupmesslist.seenBy =[...action.payload.seenBy]
            newgroupmesslist.messagelist = [...newgroupmesslist.messagelist,action.payload.messagelist[action.payload.messagelist.length-1]]
            return {...state, groupmesslist: newgroupmesslist}
        }
        case CREATE_GROUP:{
            return {...state,newgroup:action.payload}
        }
        case EDIT_TITLE:{
            let newgroupmesslist= {...state.groupmesslist}
            newgroupmesslist.title = action.payload.title
            return {...state, groupmesslist: newgroupmesslist}
        }
        case ADD_MEMBER:{
            let newgroupmesslist= {...state.groupmesslist}
            newgroupmesslist.user = [...action.payload.user]
            return {...state, groupmesslist: newgroupmesslist}
        }
        case REMOVE_MEMBER:{
            let newgroupmesslist= {...state.groupmesslist}
            newgroupmesslist.user = [...action.payload.user]
            return {...state, groupmesslist: newgroupmesslist}
        }
        case UPLOAD_GROUPIMG:
            {
                return {
                    ...state,
                    img: action.payload
                }
            }
        case CHANGE_GROUPIMG:
                {
                    return {
                        ...state,
                        updateimginfo: action.payload
                    }
                }
        case SEEN_GROUP:{
            let newgroupmesslist= {...state.groupmesslist}
            newgroupmesslist.seenBy = [...action.payload.seenBy]
            return {...state, groupmesslist: newgroupmesslist}
        }
        case FIND_PERSONAL:{
            return{
                ...state,
                conversationinfo:action.payload
            }
        }

        default: return state;
    }
}