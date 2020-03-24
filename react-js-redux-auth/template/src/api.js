import Kitsu from 'kitsu' 

const api = new Kitsu({
    baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:8080/api/v1': 'https://production-url.com'
})

export default api;