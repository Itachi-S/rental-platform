import { useUserStore } from '@/stores'
import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

// 定义 API 请求的基础 URL
const baseURL = 'http://localhost:3000'

// 创建 Axios 实例，并配置基础 URL 和超时时间
const instance = axios.create({
  baseURL,
  timeout: 100000 // 设置请求超时时间为 100 秒
})

// 请求拦截器：在每个请求发送前执行
instance.interceptors.request.use(
  config => {
    // 获取用户存储中的 token
    const userStore = useUserStore()
    // 如果存在 token，则将其添加到请求头中
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  err => Promise.reject(err) // 捕获请求错误并返回拒绝的 Promise
)

// 响应拦截器：在每个响应接收后执行
instance.interceptors.response.use(
  res => {
    // 如果响应状态码为 0（成功），则返回响应数据
    if (res.status === 200 || res.status === 201) {
      return res
    }
    // 否则，显示错误消息并拒绝 Promise
    ElMessage({ message: res.data.message || '服务异常', type: 'error' })
    return Promise.reject(res.data)
  },
  err => {
    // 显示错误消息
    ElMessage({ message: err.response?.data?.message || '服务异常', type: 'error' })
    console.log(err) // 打印错误日志
    // 如果是 401 错误（未授权），则跳转到登录页面
    if (err.response?.status === 401) {
      router.push('/login')
    }
    return Promise.reject(err) // 返回拒绝的 Promise
  }
)

// 导出 Axios 实例和基础 URL，供其他模块使用
export default instance
export { baseURL }