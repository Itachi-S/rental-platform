import request from '@/utils/request'

// 租车接口
export const rentVehicleServe = (data) => request.post('/api/rent', data)

//还车接口
export const returnVehicleServe = (orderId) => request.post(`/api/rent/return/${orderId}`)