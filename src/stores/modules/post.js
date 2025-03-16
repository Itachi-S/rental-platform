import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePostStore = defineStore(
  'rental-post',
  () => {
    const postDetail = ref({}) // 定义 post
    const setpostDetail = (obj) => (postDetail.value = obj) // 设置 post

    return { postDetail, setpostDetail }
  }
  ,
  {
    persist: true // 持久化
  }
)