import axios from "axios";
import {reactLocalStorage} from 'reactjs-localstorage';

import {DEFAULT_BASE_URL} from '../enviornment'


export const getUser = async () => axios.get(`${DEFAULT_BASE_URL}/user/meta/`)        

const getAuthToken = async () => {
    const access  = reactLocalStorage.get('access');
    const refresh = reactLocalStorage.get('refresh');
    const userString = reactLocalStorage.get('user');
    
    const user = JSON.parse(userString || '{}')


    return { access,refresh, user } || {}
}

export const initAxios = async () => {
    const auth = await getAuthToken(); 
    axios.defaults.baseURL = DEFAULT_BASE_URL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth?.access}`
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    console.log(auth,'thisiii')
    return auth;
}