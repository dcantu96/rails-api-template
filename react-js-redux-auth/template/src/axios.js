import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:8080/api/v1': 'https://production-url.com'
});

export default instance;