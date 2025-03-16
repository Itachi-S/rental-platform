<template>
  <div class="user-orders">
    <h2>个人订单</h2>
    
    <!-- 筛选订单状态 -->
    <div class="filter">
      <el-select v-model="selectedStatus" placeholder="请选择订单状态" @change="filterOrders">
        <el-option label="全部" value=""></el-option> <!-- 新增的全部选项 -->
        <el-option label="进行中" value="进行中"></el-option>
        <el-option label="已完成" value="已完成"></el-option>
        <el-option label="已取消" value="已取消"></el-option>
      </el-select>
    </div>
    
    <div class="order-cards">
      <el-card v-for="order in filteredOrders" :key="order.orderId" class="order-card">
        <div class="card-content">
          <!-- 汽车图片展示 -->
          <img :src="order.vehicle.image" alt="Vehicle Image" class="vehicle-image" />

          <!-- 订单状态 -->
          <span class="order-status" :class="getStatusClass(order.status)">
            {{ order.status === '进行中' ? '进行中' : order.status === '已完成' ? '已完成' : '已取消' }}
          </span>

          <div class="order-info">
            <strong>{{ order.vehicle.brand }} {{ order.vehicle.model }}</strong>
            <p class="order-duration">
              <span>{{ order.startDate }}</span> ——
              <span>{{ order.endDate }}</span>
            </p>
            <span class="order-price">{{ order.totalAmount }} 元</span>
          </div>

          <!-- 动态按钮 -->
          <div class="button-container">
          <!-- 仅在订单状态为“进行中”且起始时间超过 2 小时时显示取消按钮 -->
          <el-button
            v-if="order.status === '进行中' && canCancelOrder(order)"
            type="danger"
            size="small"
            @click="cancelOrder(order.orderId)"
          >
            取消订单
          </el-button>

          <!-- 进行中订单始终可以还车 -->
          <el-button
            v-if="order.status === '进行中'"
            type="primary"
            size="small"
            @click="returnCar(order.orderId)"
            :disabled="order.returned"
          >
            {{ order.returned ? '已还车' : '还车' }}
          </el-button>

          <!-- 订单已完成后显示去评价 -->
          <el-button
            v-else-if="order.status === '已完成'"
            type="success"
            size="small"
            @click="goToReview(order.vehicle.id)"
          >
            去评价
          </el-button>
        </div>

        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderListServe, updateOrderStatusServe } from '@/api/order' 
import { formatDate } from '@/utils/format_datetime'
import { returnVehicleServe } from '@/api/rent'
import { useRouter } from 'vue-router'


const router = useRouter() 
const orders = ref([])
const filteredOrders = ref([])
const selectedStatus = ref('')

// 获取订单列表
const getOrderList = async () => {
  const { data } = await getOrderListServe()
  console.log(data)
  orders.value = data.orders ? data.orders.map(order => {
    order.startDate = formatDate(order.startDate)
    order.endDate = formatDate(order.endDate)
    order.createdAt = formatDate(order.createdAt)
    return order
  }) : []
  filteredOrders.value = orders.value
  console.log(filteredOrders.value)
}

// 筛选订单
const filterOrders = () => {
  if (!selectedStatus.value) {
    filteredOrders.value = orders.value
  } else {
    filteredOrders.value = orders.value.filter(order => order.status === selectedStatus.value)
  }
}

// 判断是否可以取消订单
const canCancelOrder = (order) => {
  const now = new Date()
  const startTime = new Date(order.startDate)
  return (startTime - now) / (1000 * 60 * 60) > 2 // 超过 2 小时才能取消
}

// 还车
const returnCar = async (id) => {
  const { data } = await returnVehicleServe(id)
  console.log(data)
  ElMessage.success('还车成功')
  getOrderList()
}

// 取消订单
const cancelOrder = async (orderId) => {
  await updateOrderStatusServe(orderId, '已取消')
  ElMessage.success('订单已取消')
  getOrderList()
}

const goToReview = (carId) => {
  // 跳转到评价页面
  router.push({ name: 'VehicleDetail', params: { carId } })
}

const getStatusClass = (status) => {
  switch (status) {
  case '进行中': return 'status-in-progress'
  case '已完成': return 'status-completed'
  case '已取消': return 'status-cancelled'
  default: return ''
  }
}

getOrderList()
</script>

<style scoped>
.user-orders {
  max-width: 800px;
  margin: 0 auto;
}

.filter {
  margin-bottom: 20px;
}

.order-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* 自适应卡片布局 */
  gap: 20px;
}

.order-card {
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-info {
  font-size: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.vehicle-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.order-status {
  position: absolute;
  top: 10px;
  right: 10px;
  font-weight: bold;
  padding: 5px;
  border-radius: 4px;
  color: white;
}

.status-in-progress {
  color: blue;
}

.status-completed {
  color: gray;
}

.status-cancelled {
  color: orange;
}

.order-duration {
  font-size: 13px;
}
.order-price {
  color: orange;
}

.button-container {
  display: flex;
  justify-content: flex-end; /* 按钮右对齐 */
  gap: 10px;
}

.el-button {
  margin-top: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .order-info {
    font-size: 12px; /* 调整字体大小 */
  }

  .el-button {
    font-size: 12px; /* 调整按钮字体大小 */
  }
}
</style>
