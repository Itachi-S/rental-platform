<template>
  <div class="car-detail-container">
    <el-row>
      <!-- 左侧图片区域 -->
      <el-col :span="12">
        <div class="car-image">
          <el-image
            :src="carDetails.images?.[0]"
            alt="Car Image"
            :style="{ width: '100%', height: 'auto' }"
            fit="cover"
          >
            <template #error>
              <img src="@/assets/car-placeholder.jpg" alt="Placeholder Image">
            </template>
          </el-image>
        </div>
      </el-col>
      <!-- 右侧信息区域 -->
      <el-col :span="12">
        <div class="car-info">
          <h2 class="car-title">{{ carDetails.brand }} {{ carDetails.model }}</h2>
          <p class="car-price">价格: {{ carDetails.price }} 元 / 日</p>
          <p>座位数: {{ carDetails.seats }}</p>
          <p>动力类型: {{ carDetails.energy }}</p>
          <p>动力: {{ carDetails.power }}</p>
          <p class="car-description">描述: {{ carDetails.description }}</p>
          <div class="rent-button">
            <el-button type="primary" size="large" @click="handleRent(carDetails.carId)">立即租车</el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 评论区 -->
    <div class="comment-section">
      <h3>用户评价</h3>
      <el-row v-if="reviews.length > 0">
        <el-col v-for="(review, index) in reviews" :key="index" :span="24">
          <div class="review-item">
            <!-- 用户头像和用户名 -->
            <div class="review-header">
              <el-avatar v-if="!review.user.avatar" :icon="UserFilled" size="medium"/>
              <el-avatar v-else :src="review.user.avatar" size="medium" />
              <strong  class="username">{{ review.user.username }}</strong>
              <p class="rating-view">
                <el-rate 
                  v-model="review.rating" 
                  text-color="#ff9900" 
                  disabled />
              </p>
            </div>
            <p>{{ review.comment }}</p>
            <p class="review-date">{{ review.created_at }}</p>
            <el-link 
              v-if="review.user.username === userStore.username || userStore.role === 'admin'" 
              @click.stop="deleteReview(review.id)" 
              :underline="false" 
              :icon="Delete"
              :style="{ color: review.user.username === userStore.username ? '#409eff' : '#e6a23c' }">
            </el-link>

          </div>
        </el-col>
      </el-row>
      <el-row v-else>
        <el-col :span="24">
          <p>暂无评价，赶快成为第一个评价此车的人！</p>
        </el-col>
      </el-row>

      <div class="submit-review">
        <h3>提交您的评价</h3>
        <el-rate v-model="rating" class="rating"></el-rate>
        <el-input
          v-model="comment"
          placeholder="请输入您的评价"
          type="textarea"
          rows="4"
        ></el-input>
        <el-button type="primary" @click="submitReview" :loading="loading" class="submit-review-btn">提交评价</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getVehicleDetailServe } from '@/api/vehicle'
import { getVehicleReviewsServe, submitReviewServe,deleteReviewServe } from '@/api/review'
import { UserFilled } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format_datetime'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'
const route = useRoute()
const carDetails = ref([])
const reviews = ref([])
const rating = ref(0)
const comment = ref('')
const loading = ref(false)
const userStore = useUserStore()
// 获取车辆详细信息
const fetchCarDetails = async () => {
  const carId = route.params.carId || route.params.carId
  const { data } = await getVehicleDetailServe(carId)
  carDetails.value = data
  fetchReviews(carId)
}


// 获取评论
const fetchReviews = async (carId) => {
  const { data } = await getVehicleReviewsServe(carId)
  reviews.value = data.reviews ? data.reviews.map(review => {
    review.created_at = formatDate(review.created_at)
    return review
  }) : []
  console.log(reviews.value)
}
// console.log(reviews.value)


// 提交评价
const submitReview = async () => {
  // 校验评分和评论内容是否为空
  if (rating.value === 0) {
    ElMessage.error('请选择评分')
    return
  }
  if (!comment.value.trim()) {
    ElMessage.error('请输入评论内容')
    return
  }

  const carId = route.params.carId
  loading.value = true

  try {
    await submitReviewServe({ carId, rating: rating.value, comment: comment.value })
    comment.value = ''
    rating.value = 0
    fetchReviews(carId)
  } catch (error) {
    ElMessage.error('提交评价失败', error)
  } finally {
    loading.value = false
  }
}

// 删除评论
const deleteReview = async (reviewId) => {
  await ElMessageBox.confirm(
    '你确认要删除此评论吗?',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  try {
    await deleteReviewServe(reviewId)
    fetchReviews(carDetails.value.carId)
    ElMessage.success('删除评论成功')
  } catch (error) {
    ElMessage.error('删除评论失败', error)
  }
}
// 页面加载时获取车辆详情和评论
onMounted(() => {
  fetchCarDetails()
})
</script>

<style lang="scss" scoped>
.car-detail-container {
  width: 800px;
  margin: 0 auto;
  background-color: #fff;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.car-image {
  padding: 10px;
}

.car-info {
  padding: 20px;
}

.car-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.car-price {
  font-size: 18px;
  color: #f56c6c;
  margin-bottom: 10px;
}

.car-description {
  margin-top: 20px;
}

.rent-button {
  margin-top: 20px;
  text-align: center;
}

.comment-section {
  margin-top: 40px;
  border-top: 2px solid #f0f0f0;
  padding-top: 20px;
}

.review-item {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.review-header{
  .username,.rating-view{
  margin-left: 10px;
  font-weight: bold;
}
} 

.review-date {
  font-size: 12px;
  color: #888;
}

.submit-review {
  margin-top: 20px;
}

.rating {
  margin-bottom: 10px;
}

.submit-review-btn {
  margin-top: 10px;
}
</style>
