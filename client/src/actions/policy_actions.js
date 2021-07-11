import axios from 'axios';
import { POLICY_SERVER } from '../components/ultils/mise';
import { GET_POLICY} from './types';

export function getPolicy(){
    const request = axios.get(`${POLICY_SERVER}/getAll`)
    .then((response)=>{
        console.log(response.data)
        return response.data
    })
    return {
        type: GET_POLICY,
        payload: request
    }
}
