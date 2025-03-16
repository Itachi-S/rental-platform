import request from '@/utils/request'

// 查找城市接口
export const getCityListServe = () => request.get('/api/city')