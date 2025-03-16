<template>
  <div class="manage-orders">
    <h2>订单管理</h2>
    
    <!-- 筛选订单状态 -->
    <div class="filter">
      <el-select v-model="selectedStatus" placeholder="请选择订单状态" @change="filterOrders">
        <el-option label="全部" value=""></el-option>
        <el-option label="进行中" value="进行中"></el-option>
        <el-option label="已完成" value="已完成"></el-option>
        <el-option label="已取消" value="已取消"></el-option>
      </el-select>
    </div>
    
    <div class="order-cards">
      <el-card v-for="order in filteredOrders" :key="order.orderId" class="order-card">
        <div class="card-content">
          <img :src="order.vehicle.image" alt="Vehicle Image" class="vehicle-image" />

          <span class="order-status" :class="getStatusClass(order.status)">
            {{ order.status }}
          </span>

          <div class="order-info">
            <strong>{{ order.vehicle.brand }} {{ order.vehicle.model }}</strong>
            <p class="order-duration">
              <span>{{ order.startDate }}</span> ——
              <span>{{ order.endDate }}</span>
            </p>
            <span class="order-price">{{ order.totalAmount }} 元</span>
          </div>

          <div class="button-container">
            <!-- 仅在订单状态为“进行中”时显示取消或完成按钮 -->
            <el-button
              v-if="order.status === '进行中'"
              type="danger"
              size="small"
              @click="cancelOrder(order.orderId)"
            >
              取消订单
            </el-button>

            <el-button
              v-if="order.status === '进行中'"
              type="success"
              size="small"
              @click="completeOrder(order.orderId)"
            >
              完成订单
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

const orders = ref([])
const filteredOrders = ref([])
const selectedStatus = ref('')

// 获取订单列表
const getOrderList = async () => {
  const isAll = '1'
  const { data } = await getOrderListServe(isAll)
  orders.value = data.orders ? data.orders.map(order => {
    order.startDate = formatDate(order.startDate)
    order.endDate = formatDate(order.endDate)
    order.createdAt = formatDate(order.createdAt)
    return order
  }) : []
  filteredOrders.value = orders.value
}

// 筛选订单
const filterOrders = () => {
  if (!selectedStatus.value) {
    filteredOrders.value = orders.value
  } else {
    filteredOrders.value = orders.value.filter(order => order.status === selectedStatus.value)
  }
}

// 取消订单
const cancelOrder = async (orderId) => {
  await updateOrderStatusServe(orderId, '已取消')
  ElMessage.success('订单已取消')
  getOrderList()
}

// 完成订单
const completeOrder = async (orderId) => {
  await updateOrderStatusServe(orderId, '已完成')
  ElMessage.success('订单已完成')
  getOrderList()
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
.manage-orders {
  max-width: 800px;
  margin: 0 auto;
}

.filter {
  margin-bottom: 20px;
}

.order-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  justify-content: flex-end;
  gap: 10px;
}

.el-button {
  margin-top: 10px;
}
</style>
