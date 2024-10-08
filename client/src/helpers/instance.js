import axios from 'axios';
import Cookies from 'js-cookie'


const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const bearerInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('accessToken')}`,
    },
});

export default instance;
