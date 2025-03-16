<template>
  <el-card :body-style="{ padding: '20px' }">
    <img :src="car.images?.[0]" alt="car image" class="car-image" />
    <div class="car-info">
      <div class="car-title">
        <h3>{{ car.brand }} {{ car.model }}</h3>
        <span class="car-price"><span>￥</span>{{ car.price }} / 日</span>
      </div>
      <p class="car-detail">
        <span>{{ car.type }}</span>
        <span>{{ car.energy }}</span>
        <span>{{ car.power }}</span>
        <span>{{ car.seats }}座</span>
      </p>
      <div class="button-container">
        <!-- 插槽：默认显示“立即租车”和“查看车辆详情” -->
        <slot name="actions">
          <el-button type="primary" @click="handleRent(car.carId)">立即租车</el-button>
          <el-button @click="viewCarDetails(car.carId)">查看车辆详情</el-button>
        </slot>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import router from '@/router'
import { defineProps } from 'vue'

const props = defineProps({
  car: {
    type: Object,
    required: true
  }
})

const handleRent = (carId) => {
  router.push({
    name: 'OrderPage',
    query: { carId }
  })
}

const viewCarDetails = (carId) => {
  router.push({ name: 'VehicleDetail', params: { carId } })
}
</script>

<style lang="scss" scoped>
h3 {
  padding: 0;
  margin: 0;
}

span {
  font-size: 20px;
}

.el-button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
}

.button-container {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.car-info {
  text-align: center;
}

.car-title {
  margin: 5px 0;
  padding: 2px;
}

.car-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.el-card {
  margin: 10px;
}

.car-detail {
  margin: 10px 0;
  span {
    color: #999;
    font-size: 12px;
  }
}

.car-detail span {
  margin: 0 5px;
}

.car-price {
  color: orange;
  font-size: 16px;
  margin: 10px;
}

</style>
