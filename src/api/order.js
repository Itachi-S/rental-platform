import request from '@/utils/request'


// 获取订单列表
export const getOrderListServe = (isAll) => request.get('/api/orders',{ params:{isAll} })

//更新订单状态
export const updateOrderStatusServe = (orderId, status) => request.post(`/api/orders/${orderId}/status`, { status })