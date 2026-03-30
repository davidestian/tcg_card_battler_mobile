import axios from 'axios';
import { BASE_URI } from '../config';

const publicAPI = axios.create({
    baseURL: BASE_URI, // Auto-loaded from .env
    timeout: 10000,
});

export default publicAPI;
