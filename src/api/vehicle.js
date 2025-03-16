import request from '@/utils/request'

// 获取车辆列表接口
export const getVehicleListServe = (params) => request.get('/api/cars', { params })

// 获取车辆详情接口
export const getVehicleDetailServe = (id) => request.get(`/api/cars/${id}/detail`)

//获取车辆品牌列表
export const getVehicleBrandsServe = () => request.get('/api/cars/brands')
//删除车辆
export const deleteVehicleServe = (id) => request.delete(`/api/cars/${id}`)
//新增车辆
export const addVehicleServe = (data) => request.post('/api/cars', data, { headers: { 'Content-Type': 'multipart/form-data' } })
//更新车辆
export const updateVehicleServe = (id, data) => request.put(`/api/cars/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })