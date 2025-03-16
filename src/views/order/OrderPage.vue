<template>
  <div class="order-container">
    <el-card class="order-card">
      <!-- 车辆信息展示 -->
      <div class="car-info">
        <img :src="carData.images?.[0]" class="car-image" />
        <div class="details">
          <h2>{{ carData.brand }} {{ carData.model }}</h2>
          <p class="price">{{ carData.price }} / 日</p>
        </div>
      </div>
      <el-divider />
      <div class="rent-form">
        <el-form label-position="top">
          <el-form-item label="租赁时间">
          <!-- 响应式日期时间选择 -->
           <!-- 桌面端使用范围选择器 -->
        <el-date-picker
          v-if="!isMobile"
          v-model="localDateTimeRange"
          type="datetimerange"
          range-separator="至"
          :start-placeholder="startPlaceholder"
          :end-placeholder="endPlaceholder"
          value-format="YYYY-MM-DD HH:mm"
        />

        <!-- 移动端分开展示 -->
        <template v-else>
          <el-date-picker
            v-model="localDateTimeRange[0]"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DD HH:mm"
          />
          <el-date-picker
            v-model="localDateTimeRange[1]"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DD HH:mm"
          />
        </template>
          </el-form-item>
        </el-form>
      </div>
      <!-- 租赁信息 -->
      <el-divider />
      <div class="rent-info">
        <el-descriptions title="租赁详情" :column="1" border>
          <el-descriptions-item label="取车城市">
            {{ orderInfo.city || '未选择' }}
          </el-descriptions-item>
          <el-descriptions-item label="租赁期间">
            {{ formattedDateTimeRange }}
          </el-descriptions-item>
          <el-descriptions-item label="租赁天数">
            {{ duration }} 天
          </el-descriptions-item>
          <el-descriptions-item label="总费用">
            {{ totalPrice }} 元
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <el-divider />
      <div class="actions">
        <el-button type="primary" size="large" @click="openPaymentDialog" :disabled="!formValid">
          立即支付
        </el-button>
      </div>
    </el-card>

         <!-- **🚀 支付弹窗** -->
    <el-dialog v-model="showPaymentDialog" title="确认支付" width="400px">
      <p><strong>支付金额：</strong>￥{{ totalPrice }}</p>
      <p><strong>支付倒计时：</strong> <span :class="{ danger: countdown <= 5 }">{{ countdown }} 秒</span></p>

      <el-button type="primary" @click="confirmPayment" :disabled="isPaid || isTimeout">确认支付</el-button>
      <el-button @click="cancelPayment" :disabled="isPaid || isTimeout">取消</el-button>

      <el-result v-if="isPaid" icon="success" title="支付成功" sub-title="订单创建成功！">
        <template #extra>
          <el-button type="primary" @click="goToOrders">查看订单</el-button>
        </template>
      </el-result>

      <el-result v-if="isTimeout" icon="error" title="支付失败" sub-title="支付超时，请重新支付">
        <template #extra>
          <el-button type="danger" @click="showPaymentDialog = false">关闭</el-button>
        </template>
      </el-result>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getVehicleDetailServe } from '@/api/vehicle'
import { rentVehicleServe } from '@/api/rent'
import { useRentStore } from '@/stores'
const route = useRoute()
const router = useRouter()
const localDateTimeRange = ref([])
const rentStore = useRentStore()
// 车辆数据（实际应从API获取）
const carData = ref({})
// 响应式判断移动端
const isMobile = computed(() => window.innerWidth < 768)
const showPaymentDialog = ref(false)
// 提示文本优化
const startPlaceholder = computed(() => 
  isMobile.value ? '开始时间' : '开始日期时间（YYYY-MM-DD HH:mm）'
)
// 表单验证
const formValid = computed(() => {
  const hasValidTime = localDateTimeRange.value.length === 2 && 
                       new Date(localDateTimeRange.value[1]) > new Date(localDateTimeRange.value[0])
    
  return  hasValidTime
})
console.log(formValid.value)
// 订单数据
const orderInfo = ref({
  carId: route.query.carId,
  city: '',
  startDateTime: rentStore.rentInfo.dateTimeRange[0],
  endDateTime: rentStore.rentInfo.dateTimeRange[1]
})

const getVehicleDetail = async () => {
  console.log('车辆ID'+route.query.carId)
  const { data } = await getVehicleDetailServe(route.query.carId)
  console.log(data)
  carData.value = data
  orderInfo.value.city = carData.value.cityName
  // console.log(carData.value.images[0])
}

// 计算属性
const formattedDateTimeRange = computed(() => {
  if (!orderInfo.value.startDateTime || !orderInfo.value.endDateTime) {
    return '未选择时间'
  }
  return `${orderInfo.value.startDateTime} 至 ${orderInfo.value.endDateTime}`
})

const duration = computed(() => {
  if (!orderInfo.value.startDateTime || !orderInfo.value.endDateTime) return 0
  const start = new Date(orderInfo.value.startDateTime)
  const end = new Date(orderInfo.value.endDateTime)
  const diff = end - start
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
})

const totalPrice = computed(() => {
  return carData.value.price * duration.value
})
// 监听 localDateTimeRange的变化，更新 orderInfo
watch([localDateTimeRange], () => {
  if (localDateTimeRange.value.length === 2) {
    orderInfo.value.startDateTime = localDateTimeRange.value[0]
    orderInfo.value.endDateTime = localDateTimeRange.value[1]
  }
})
// 初始化验证
onMounted(() => {
  if (!route.query.carId) {
    ElMessage.error('车辆信息错误')
    router.back()
  }
  getVehicleDetail()
  localDateTimeRange.value = rentStore.rentInfo.dateTimeRange
})

// 提交订单
// **🚀 用户点击 "立即支付"，弹出支付窗口**
const openPaymentDialog = () => {
  showPaymentDialog.value = true
  startCountdown()
}

// **🚀 支付倒计时**
const countdown = ref(30)
const isPaid = ref(false)
const isTimeout = ref(false)

const startCountdown = () => {
  countdown.value = 30
  isPaid.value = false
  isTimeout.value = false

  const timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
      isTimeout.value = true
      ElMessage.error('支付超时，请重新支付')
    }
  }, 1000)
}

// **🚀 确认支付后创建订单**
const confirmPayment = async () => {
  try {
    isPaid.value = true
    ElMessage.success('支付成功！正在创建订单...')

    // **创建订单**
    const { data } = await rentVehicleServe(orderInfo.value)
    if (data && data.orderId) {

      // **🚀 支付成功，关闭弹窗**
      setTimeout(() => {
        showPaymentDialog.value = false
        router.push('/orders')
      }, 2000)
    } else {
      ElMessage.error('订单创建失败，请稍后再试')
    }
  } catch (error) {
    ElMessage.error('支付失败，请稍后再试')
  }
}

// **🚀 取消支付**
const cancelPayment = () => {
  ElMessage.info('支付已取消')
  showPaymentDialog.value = false
}

// **🚀 跳转**
const goToOrders = () => router.push('/orders')
</script>

<style lang="scss" scoped>
/* 新增移动端优化样式 */
@media (max-width: 768px) {
  .el-date-editor {
    :deep(.el-picker-panel) {
      width: 100vw !important;
      left: 0 !important;
      transform: none !important;
    }
    
    :deep(.el-time-spinner__wrapper) {
      max-width: 100%;
    }
  }
}
.order-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;

  .car-info {
    display: flex;
    gap: 20px;
    align-items: center;

    .car-image {
      width: 300px;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
    }

    .details {
      flex: 1;
      
      h2 {
        margin-bottom: 10px;
      }
      
      .price {
        font-size: 18px;
        color: #f56c6c;
      }
    }
  }

  .rent-info {
    margin: 20px 0;
  }

  .actions {
    text-align: center;
    padding: 20px 0;
    
    .el-button {
      width: 200px;
    }
  }
}

@media (max-width: 768px) {
  .car-info {
    flex-direction: column;
    
    .car-image {
      width: 100% !important;
    }
  }
}
</style>