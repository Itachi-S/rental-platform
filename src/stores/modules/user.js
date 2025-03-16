import { defineStore } from 'pinia'
import { ref } from 'vue'

// 用户模块
export const useUserStore = defineStore(
  'rental-user',
  () => {
    const token = ref('') // 定义 token
    const username = ref('') // 定义用户名
    const avatar = ref('')
    const role = ref('')
    const setInfo = (info) => {
      token.value = info.token 
      username.value = info.username
      avatar.value = info.avatar
      role.value = info.role
    } // 设置 token

    const removeInfo = () => {
      token.value = ''
      username.value = ''
      avatar.value = ''
      role.value = ''
    }
    return { token, avatar, username, role, setInfo, removeInfo }
  },
  {
    persist: true // 持久化
  }
)
