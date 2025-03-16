<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getVehicleListServe, getVehicleBrandsServe } from '@/api/vehicle'
import { useRentStore } from '@/stores'
import VehicleCard from '@/components/VehicleCard.vue'

const router = useRouter()
const rentStore = useRentStore()
const cars = ref([]) // 车辆列表数据
const brands = ref([]) // 品牌数据

// 请求参数
const vehicleparams = ref({
  availability: 1,
  brand: '',
  energy: '',
  seats: '',
  cityId: null,
  page: 1,
  limit: 1000,
})

// 筛选条件
const energyType = ref('')
const seatCount = ref('')
const selectedBrand = ref('')
const sortOption = ref('default')

// 加载品牌数据
const fetchBrands = async () => {
  const { data } = await getVehicleBrandsServe()
  brands.value = data.brands
}

// 点击"筛选"按钮才请求接口
const fetchCars = async () => {
  vehicleparams.value.cityId = rentStore.rentInfo.city.cityId
  vehicleparams.value.energy = energyType.value
  vehicleparams.value.seats = seatCount.value
  vehicleparams.value.brand = selectedBrand.value
  console.log(vehicleparams.value)
  const { data } = await getVehicleListServe(vehicleparams.value)
  console.log(data)
  cars.value = data.cars || []
}

// 按排序选项进行排序
const sortedCars = computed(() => {
  let sorted = [...cars.value]

  if (sortOption.value === 'price_high') {
    return sorted.sort((a, b) => b.price - a.price)
  } else if (sortOption.value === 'price_low') {
    return sorted.sort((a, b) => a.price - b.price)
  }
  return sorted
})

// 查看车辆详情
const viewCarDetails = (carId) => {
  router.push({ name: 'VehicleDetail', params: { carId } })
}

// 重置筛选
const resetFilters = () => {
  energyType.value = ''
  seatCount.value = ''
  selectedBrand.value = ''
  sortOption.value = 'default'
  cars.value = []
  fetchCars()
}

// 页面加载时获取品牌数据
onMounted(() => {
  fetchCars()
  fetchBrands()
})
</script>

<template>
  <div>
    <!-- 顶部筛选和排序 -->
    <div class="tool-bar">
      <!-- 排序 -->
      <el-select v-model="sortOption" placeholder="排序方式">
        <el-option label="默认排序" value="default"></el-option>
        <el-option label="高价优先" value="price_high"></el-option>
        <el-option label="低价优先" value="price_low"></el-option>
      </el-select>
      <div class="filter">
              <!-- 品牌 -->
      <el-select v-model="selectedBrand" placeholder="品牌" clearable>
        <el-option
          v-for="brand in brands"
          :key="brand"
          :label="brand"
          :value="brand"
        />
      </el-select>
      <!-- 能源类型 -->
      <el-select v-model="energyType" placeholder="能源类型" clearable>
        <el-option label="汽油" value="汽油"></el-option>
        <el-option label="新能源" value="新能源"></el-option>
      </el-select>
      <!-- 座位数 -->
      <el-select v-model="seatCount" placeholder="座位数" clearable>
        <el-option label="2座" value="2"></el-option>
        <el-option label="4座" value="4"></el-option>
        <el-option label="5座" value="5"></el-option>
        <el-option label="6座" value="6"></el-option>
        <el-option label="7座" value="7"></el-option>
      </el-select>
      <!-- 筛选按钮 -->
      <el-button type="primary" @click="fetchCars">筛选</el-button>
      <!-- 重置按钮 -->
      <el-button @click="resetFilters">重置</el-button>
      </div>

    </div>

    <!-- 车辆列表 -->
    <el-row :gutter="20">
      <el-col
        v-for="car in sortedCars"
        :key="car.id"
        :span="6"
      >
        <VehicleCard
          :car="car"
          @viewDetails="viewCarDetails"
        />
      </el-col>
    </el-row>

    <!-- 空状态提示 -->
    <div v-if="sortedCars.length === 0" class="empty-state">
      <el-empty description="暂无符合条件的车辆" />
    </div>
  </div>
</template>

<style scoped>
.tool-bar {
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  align-items: center;
  .filter {
    display: flex;
    gap: 10px;
  }
}

.el-select {
  width: 160px;
}


.empty-state {
  margin-top: 50px;
  text-align: center;
}

.el-row {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .el-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
