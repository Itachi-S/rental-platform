<template>
  <div class="payment-container">
    <h2>订单支付</h2>
    <el-card class="order-card">
      <p><strong>订单编号：</strong>{{ orderId }}</p>
      <p><strong>支付金额：</strong>￥{{ totalAmount }}</p>
      <p><strong>支付倒计时：</strong> <span :class="{ danger: countdown <= 5 }">{{ countdown }} 秒</span></p>

      <el-button type="primary" @click="simulatePayment" :disabled="isPaid || isTimeout">确认支付</el-button>
      <el-button @click="cancelPayment" :disabled="isPaid || isTimeout">取消支付</el-button>
    </el-card>

    <el-result v-if="isPaid" icon="success" title="支付成功" sub-title="您的订单已支付成功！">
      <template #extra>
        <el-button type="primary" @click="goToOrders">查看订单</el-button>
      </template>
    </el-result>

    <el-result v-if="isTimeout" icon="error" title="支付失败" sub-title="支付超时，请重新下单！">
      <template #extra>
        <el-button type="danger" @click="goToHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { updateOrderStatusServe } from '@/api/order'

const route = useRoute()
const router = useRouter()

const orderId = ref(route.query.orderId || '')
const totalAmount = ref(route.query.totalAmount || 0)
const countdown = ref(30) // 30 秒倒计时
const isPaid = ref(false)
const isTimeout = ref(false)

// **🚀 倒计时支付超时**
const startCountdown = () => {
  const timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
      isTimeout.value = true
      ElMessage.error('支付超时，订单取消')
    }
  }, 1000)
}

// **🚀 模拟支付**
const simulatePayment = async () => {
  if (!orderId.value) {
    ElMessage.error('订单信息错误')
    return
  }

  isPaid.value = true
  ElMessage.success('支付成功！')

  // **更新订单状态为 "已支付"**
  await updateOrderStatusServe(orderId.value, '已支付')

  setTimeout(() => {
    router.push('/orders')
  }, 2000)
}

// **🚀 取消支付**
const cancelPayment = () => {
  ElMessage.info('支付已取消')
  router.push('/orders')
}

// **🚀 跳转**
const goToOrders = () => router.push('/orders')
const goToHome = () => router.push('/')

onMounted(() => startCountdown())
</script>

<style scoped>
.payment-container {
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
}

.order-card {
  padding: 20px;
  margin-bottom: 20px;
}

.danger {
  color: red;
  font-weight: bold;
}
</style>
