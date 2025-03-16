<script setup>
import { getVehicleListServe } from '@/api/vehicle'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRentStore } from '@/stores'
import { getCityListServe } from '@/api/city'
import banner1 from '@/assets/banner1.jpg'
import banner2 from '@/assets/banner2.jpg'
import banner3 from '@/assets/banner3.jpg'
// 修改为日期时间范围参数
const city = ref(null)
const dateTimeRange = ref([])  // 格式：[startDateTime, endDateTime]

const router = useRouter()
const rentStore = useRentStore()

const disabledDate = (date) => {
  return date.getTime() < new Date().setHours(0, 0, 0, 0)
}
/* 处理选车按钮 */
const handleRent = () => {
  // 检查 selectedCity 是否有值
  if (!city.value) {
    ElMessage.warning('请选择城市')
    return
  }
  // 检查 dateTimeRange 是否有值
  if (dateTimeRange.value.length !== 2) {
    ElMessage.warning('请选择日期时间范围')
    return
  }
  rentStore.setRentInfo({city, dateTimeRange})
  router.push('/vehicles')
}


// 查看车辆详情的处理方法
// const viewCarDetails = (carId) => {
//   router.push({ name: 'VehicleDetail', params: { carId } })
// }
// 示例数据
const carouselItems = [
  { image: banner1 },
  { image: banner2 },
  { image: banner3 }
]
const hotCars = ref([])  // 热门车型数据
//获取热门车型
const getHotCars = async () => {
  const { data } = await getVehicleListServe({ page: 1, limit: 4 })
  console.log(data)
  hotCars.value = data.cars
}
getHotCars()
//获取城市列表
const cities = ref([])
const getCityList = async () => {
  const { data } = await getCityListServe()
  console.log(data)
  cities.value = data.cities
  console.log(cities.value)
}
getCityList()
</script>

<template>
  <div>
    <!-- 轮播图 -->
    <div class="carousel-container">
      <el-carousel trigger="hover" height="550px" style="width: 100%;">
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <img :src="item.image" alt="carousel image" class="carousel-image" />
        </el-carousel-item>
      </el-carousel>
      <!-- 快速搜索框 -->
      <div class="search-box">
        <el-row type="flex" justify="center" class="search-row">
          <el-col :xs="24" :sm="6" :md="6" :lg="6">
            <el-select value-key="cityId" v-model="city"  placeholder="选择城市">
              <el-option v-for="city in cities" :key="city.cityId" :label="city.cityName" :value="city"></el-option>
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="6" :md="6" :lg="12">
            <!-- 修改为日期时间范围选择器 -->
            <el-date-picker
              v-model="dateTimeRange"
              type="datetimerange"  
              range-separator="至"
              start-placeholder="开始日期时间"
              end-placeholder="结束日期时间"
              value-format="YYYY-MM-DD HH:mm"  
              :disabled-date="disabledDate"
              style="width: 100%"
            />
          </el-col>
        </el-row>

        <!-- 选车按钮 -->
        <el-row type="flex" justify="center">
          <el-col :xs="24" :sm="6" :md="6" :lg="6">
            <el-button type="primary" @click="handleRent">立即选车</el-button>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 热门车型展示 -->
    <div class="hot-cars">
      <h2 >热门车型</h2>
      <el-row :gutter="20" class="car-list">
        <el-col :xs="24" :sm="12" :md="6" :lg="6" v-for="(car, index) in hotCars" :key="index">
          <VehicleCard 
            :car="car" 
          />
        </el-col>
      </el-row>
    </div>

    <!-- 底部导航 -->
    <el-footer class="footer">
      <el-row type="flex" justify="center">
        <el-col :span="20">
          <div class="footer-links">
            <a href="#">联系我们</a> | 
            <a href="#">租赁政策</a> | 
            <a href="#">隐私政策</a>
          </div>
        </el-col>
      </el-row>
    </el-footer>
  </div>
</template>

<style lang="scss" scoped>
/* 栅格系统布局 */
.logo {
    width: 100px;
    height: auto;
  }
/* .el-row {
  margin-bottom: 20px;
} */

.menu {
  display: inline-block;
  background-color: transparent;
}
.carousel-container {
  position: relative;
}
.search-box {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 80%; /* 设置宽度 */
  max-width: 800px; /* 最大宽度 */
}

.search-row {
  margin-bottom: 20px;
}

.el-select {
  width: 100%;
}

.el-button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
}

.el-header {
  background-color: #fff;
}

.header-content {
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-bar {
  text-align: center;
  
}

.footer {
  background-color: #333;
  color: #fff;
  padding: 20px 0;
}

.footer-links {
  text-align: center;
}

.footer-links a {
  color: #fff;
  margin: 0 15px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: none;
}

.hot-cars {
  // margin: 20px 0;
  background-color: #fff;
  h2 {
    display: inline-block;
    margin: 0;
    padding: 20px 0;
  }
  .car-list {
    display: flex;
    justify-content: space-between;
  }
}


/* 针对小屏设备调整 el-date-picker 的布局 */
@media (max-width: 768px) {
  :deep(.el-date-range-picker .el-picker-panel__body) {
    display: flex !important;
    flex-direction: column !important; /* 强制竖直排列 */
    width: 100% !important;
  }

  :deep(.el-date-range-picker__editors-wrap) {
    display: flex !important;
    flex-direction: column !important; /* 强制竖直排列 */
    width: 100% !important;
  }

  :deep(.el-date-range-picker__content) {
    width: 100% !important;
  }

  :deep(.el-picker-panel [slot=sidebar], .el-picker-panel__sidebar) {
    display: none !important; /* 强制隐藏侧边栏 */
  }

  :deep(.el-picker-panel__body) {
    margin-left: 0 !important; /* 移除任何左边距 */
  }

  :deep(.el-date-range-picker) {
    width: 100% !important; /* 确保日期选择器宽度适应 */
  }
}

  



</style>
