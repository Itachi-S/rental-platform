import request from '@/utils/request'

//登录接口
export const userLoginServe = ({ username, password }) =>
  request.post('/api/auth/login', { username, password })
//注册接口
export const userRegisterServe = (data) => request.post('/api/auth/register', data)

//获取用户信息
export const getUserInfoServe = () => request.get('/api/auth/getUserInfo')

//修改用户信息
export const updateUserInfoServe = (data) => request.put('/api/auth/updateUserInfo', data)