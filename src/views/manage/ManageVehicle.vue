<template>
  <div>
    <!-- 顶部工具栏 -->
    <div class="tool-bar">
      <el-button type="primary" @click="openAddCarDrawer">添加车辆</el-button>
      <div class="filter">
        <el-select v-model="selectedBrand" placeholder="品牌" clearable>
          <el-option v-for="brand in brands" :key="brand" :label="brand" :value="brand" />
        </el-select>
        <el-select v-model="energyType" placeholder="能源类型" clearable>
          <el-option label="汽油" value="汽油"></el-option>
          <el-option label="新能源" value="新能源"></el-option>
        </el-select>
        <el-select v-model="seatCount" placeholder="座位数" clearable>
          <el-option label="2座" value="2"></el-option>
          <el-option label="4座" value="4"></el-option>
          <el-option label="5座" value="5"></el-option>
          <el-option label="6座" value="6"></el-option>
          <el-option label="7座" value="7"></el-option>
        </el-select>
        <el-select v-model="selectedCity" placeholder="城市" clearable>
          <el-option v-for="city in cities" :key="city.cityId" :label="city.cityName" :value="city.cityId" />
        </el-select>
        <el-button type="primary" @click="fetchCars">筛选</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <!-- 车辆列表 -->
    <el-row :gutter="5">
      <el-col v-for="car in sortedCars" :key="car.id" :span="6">
        <VehicleCard class="vehicle-card" :car="car">
          <template #actions>
            <el-button type="warning" @click="openEditCarDrawer(car)">修改车辆</el-button>
            <el-button type="danger" @click="deleteVehicle(car.id)">删除车辆</el-button>
          </template>
        </VehicleCard>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <div v-if="sortedCars.length === 0" class="empty-state">
      <el-empty description="暂无车辆" />
    </div>

    <!-- 抽屉 - 添加/修改车辆 -->
    <el-drawer v-model="drawerVisible" :title="isEditMode ? '修改车辆' : '添加车辆'" size="50%">
      <el-form ref="vehicleFormRef" :model="vehicleForm" :rules="rules" label-width="100px">
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="vehicleForm.brand" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="vehicleForm.model" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="vehicleForm.type">
            <el-option label="轿车" value="轿车" />
            <el-option label="SUV" value="SUV" />
            <el-option label="跑车" value="跑车" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="座位数" prop="seats">
          <el-input-number v-model="vehicleForm.seats" :min="2" :max="7" />
        </el-form-item>
        <el-form-item label="每日价格" prop="price_per_day">
          <el-input-number v-model="vehicleForm.price_per_day" :min="0" step="5" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="vehicleForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="可用性" prop="availability">
          <el-switch v-model="vehicleForm.availability" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="能源类型" prop="energy">
          <el-select v-model="vehicleForm.energy">
            <el-option label="汽油" value="汽油" />
            <el-option label="新能源" value="新能源" />
          </el-select>
        </el-form-item>
        <el-form-item label="动力" prop="power">
          <el-input v-model="vehicleForm.power" />
        </el-form-item>
        <el-form-item label="城市" prop="cityId">
          <el-select v-model="vehicleForm.cityId">
            <el-option v-for="city in cities" :key="city.cityId" :label="city.cityName" :value="city.cityId" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传图片">
          <el-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleImageUpload"
            :on-remove="handleRemove"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="drawerVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVehicleListServe, getVehicleBrandsServe, addVehicleServe, updateVehicleServe, deleteVehicleServe } from '@/api/vehicle'
import { getCityListServe } from '@/api/city'
import VehicleCard from '@/components/VehicleCard.vue'

const cars = ref([])
const brands = ref([])
const energyType = ref('')
const seatCount = ref('')
const selectedBrand = ref('')
const sortOption = ref('default')
const selectedCity = ref('')

// 抽屉状态
const drawerVisible = ref(false)
const isEditMode = ref(false)

// 车辆表单
const vehicleForm = ref({
  id: null,
  brand: '',
  model: '',
  type: '轿车',
  seats: 4,
  price_per_day: 0,
  description: '',
  availability: 1,
  energy: '',
  power: '',
  cityId: ''
})

// 图片上传列表
const fileList = ref([])

const cities = ref([])

// 表单校验规则
const rules = ref({
  brand: [
    { required: true, message: '品牌不能为空', trigger: 'blur' }
  ],
  model: [
    { required: true, message: '型号不能为空', trigger: 'blur' }
  ],
  seats: [
    { required: true, message: '座位数不能为空', trigger: 'blur' }
  ],
  price_per_day: [
    { required: true, message: '每日价格不能为空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === 0) {
          callback(new Error('价格不能为 0'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  energy: [
    { required: true, message: '能源类型不能为空', trigger: 'change' }
  ],
  power: [
    { required: true, message: '动力不能为空', trigger: 'blur' }
  ],
  cityId: [
    { required: true, message: '城市不能为空', trigger: 'change' }
  ]
})

const vehicleFormRef = ref(null)

const fetchBrands = async () => {
  const { data } = await getVehicleBrandsServe()
  brands.value = data.brands
}

const fetchCities = async () => {
  const { data } = await getCityListServe()
  cities.value = data.cities
}

const fetchCars = async () => {
  const { data } = await getVehicleListServe({
    brand: selectedBrand.value,
    energy: energyType.value,
    seats: seatCount.value,
    cityId: selectedCity.value,
    limit: 1000
  })

  cars.value = data.cars ? data.cars.map(car => {
    if (car.images) {
      car.images = car.images.map(image => {
        // 检查图片路径是否以 http 开头
        if (!image.startsWith('http')) {
          return 'http://localhost:3000' + image
        }
        return image
      })
    }
    return car
  }) : []
  console.log('cars', cars.value)
}

const resetFilters = () => {
  energyType.value = ''
  seatCount.value = ''
  selectedBrand.value = ''
  selectedCity.value = ''
  fetchCars()
}

const sortedCars = computed(() => {
  let sorted = [...cars.value]
  if (sortOption.value === 'price_high') return sorted.sort((a, b) => b.price_per_day - a.price_per_day)
  if (sortOption.value === 'price_low') return sorted.sort((a, b) => a.price_per_day - b.price_per_day)
  return sorted
})

// 打开“添加车辆”抽屉
const openAddCarDrawer = () => {
  isEditMode.value = false
  vehicleForm.value = {
    id: null,
    brand: '',
    model: '',
    type: '轿车',
    seats: 4,
    price_per_day: 0,
    description: '',
    availability: 1,
    energy: '',
    power: '',
    cityId: ''
  }
  fileList.value = []
  drawerVisible.value = true
}

// 打开“修改车辆”抽屉
const openEditCarDrawer = (car) => {
  isEditMode.value = true
  vehicleForm.value = {
    ...car,
    price_per_day: car.price,
    availability: car.availability ? 1 : 0
  }
  fileList.value = car.images ? car.images.map(img => ({ url: img })) : []
  drawerVisible.value = true
}

// 处理图片上传
const handleImageUpload = (file) => {
  fileList.value.push(file)
}

// 处理图片删除
const handleRemove = (file) => {
  fileList.value = fileList.value.filter(item => item.uid!== file.uid)
}

// 提交表单
const submitForm = async () => {
  vehicleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const formData = new FormData()
        formData.append('brand', vehicleForm.value.brand)
        formData.append('model', vehicleForm.value.model)
        formData.append('type', vehicleForm.value.type)
        formData.append('seats', vehicleForm.value.seats)
        formData.append('price', vehicleForm.value.price_per_day)
        formData.append('description', vehicleForm.value.description)
        formData.append('availability', vehicleForm.value.availability)
        formData.append('energy', vehicleForm.value.energy)
        formData.append('power', vehicleForm.value.power)
        formData.append('cityId', vehicleForm.value.cityId)

        fileList.value.forEach(file => {
          formData.append('images', file.raw)
        })

        if (isEditMode.value) {
          await updateVehicleServe(vehicleForm.value.id, formData)
          ElMessage.success('车辆修改成功')
        } else {
          await addVehicleServe(formData)
          ElMessage.success('车辆添加成功')
        }
        drawerVisible.value = false
        fetchCars()
      } catch (error) {
        ElMessage.error('操作失败，请稍后再试')
      }
    } else {
      ElMessage.error('表单存在必填项未填写，请检查')
      return false
    }
  })
}

// 删除车辆
const deleteVehicle = async (carId) => {
  try {
    await ElMessageBox.confirm('确定要删除这辆车吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteVehicleServe(carId)
    ElMessage.success('车辆删除成功')
    fetchCars()
  } catch (error) {
    ElMessage.error('删除失败，请稍后再试')
  }
}

onMounted(() => {
  fetchCars()
  fetchBrands()
  fetchCities()
})
</script>
<style scoped>
.tool-bar {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background-color: #fff;
  margin-bottom: 20px;
}

.filter {
  display: flex;
  width: 100%;
  gap: 10px;
}

.empty-state {
  text-align: center;
  margin-top: 50px;
}
</style>