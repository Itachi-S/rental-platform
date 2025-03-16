import request from '@/utils/request'

// 获取评论接口
export const getVehicleReviewsServe = (carId) => request.get(`/api/review/${carId}`)

// 添加评论接口
export const submitReviewServe = (data) => request.post('/api/review', data)

// 删除评论接口
export const deleteReviewServe = (reviewId) => request.delete(`/api/review/${reviewId}`)