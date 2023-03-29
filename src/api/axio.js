import axios from 'axios'
let service = axios.create({
    timeout: 500000
})
export let baogangAxios = service.get
export let baogangPlotAxios = axios.post
export default {
    get (api, params) {
        if (params) {
            return service.get(api, { params })
        } else {
            return service.get(api)
        }
    },
    post (api, params) {
        if (params) {
            return axios.post(api, params)
        } else {
            console.log('必须带参数!')
        }
    }
}