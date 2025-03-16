<template>
  <div class="user-info">
    <h2>基本信息</h2>
    <el-form :model="form" ref="formDom" :rules="rules" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="form.oldPassword" type="password" placeholder="请输入原密码" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入新密码" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary"  @click="updateUserInfo">保存修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfoServe, updateUserInfoServe } from '@/api/user'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
// 表单数据模型
const form = ref({
  username: '',
  email: '',
  oldPassword: '', // 新增原密码字段
  password: '',
  confirmPassword: ''
})

// 用于访问表单实例
const formDom = ref(null)

// 校验规则
const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'change' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'change' },
    { min: 5, max: 10, message: '用户名长度必须为5 - 10位字符', trigger: 'change' }
  ],
  password: [
    { required: false, message: '请输入密码', trigger: 'change' },
    { pattern: /^\S{6,12}$/, message: '必须是6~12位非空字符', trigger: 'change' }
  ],
  confirmPassword: [
    { required: false, message: '请确认密码', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'change' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'change' }
  ]
}

// 获取用户信息方法
const getUserInfo = async () => {
  const { data } = await getUserInfoServe()
  form.value.username = data.user.username
  form.value.email = data.user.email
}

onMounted(() => {
  getUserInfo()
  console.log(form.value)
})

const updateUserInfo = async () => {
  const { data } = await updateUserInfoServe(form.value)
  console.log(data)
  // ElMessage.success('修改成功')
  // userStore.removeToken()
  // router.push('/login')
}
</script>

<style scoped>
h2 {
  margin-left: 50px;
}
.user-info {
  max-width: 600px;
  margin: 0 auto;
}
</style>
