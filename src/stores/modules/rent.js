import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRentStore = defineStore(
  'rental-rent',
  () => {
    const rentInfo = ref({
      city: {},
      dataTimeRange: [],
    }) // 定义 rent
    const setRentInfo = (obj) => (rentInfo.value = obj) // 设置 rent

    const removeRentInfo = () => {
      rentInfo.value.city = ''
      rentInfo.value.dataTimeRange = []
    }
    return { rentInfo, setRentInfo, removeRentInfo }
  },
  {
    persist: true // 持久化
  }
)