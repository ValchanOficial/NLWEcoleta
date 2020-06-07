import axios from 'axios';
import localIpUrl from 'local-ip-url';

const api = axios.create({
    baseURL: `http://${localIpUrl('public')}:3333`
});

export default api;
