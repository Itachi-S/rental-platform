<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { userLoginServe, userRegisterServe } from '@/api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
// 绑定表单数据
const formRef = ref(null)

// 获取表单值
const formModel = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 10, message: '用户名长度必须为5 - 10位字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^\S{6,12}$/, message: '必须是6~12位非空字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formModel.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const isLogin = ref(route.params.isLogin ? false : true)

const onLogin = async () => {
  await formRef.value.validate()
  const { data } = await userLoginServe({ username: formModel.value.username, password: formModel.value.password })
  console.log(data)
  userStore.setInfo(
    {
      token: data.token,
      username:formModel.value.username, 
      avatar: data.avatar ,
      role: data.role
    })
  ElMessage.success('登录成功')
  router.push('/')
}

const onRegister = async () => {
  await formRef.value.validate()
  const { data } = await userRegisterServe(formModel.value)
  console.log(data)
  ElMessage.success('注册成功')
  toggleForm()
}

const toggleForm = () => {
  isLogin.value = !isLogin.value
  formModel.value = { username: '', password: '', confirmPassword: '', email: '' }
}
</script>

<template>
  <div class="login-container">
    <el-form v-if="isLogin" size="large" :model="formModel" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item><h1 class="login-title">登录</h1></el-form-item>
      <el-form-item prop="username">
        <el-input v-model="formModel.username" :prefix-icon="User" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="formModel.password" :prefix-icon="Lock" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" block @click="onLogin">登录</el-button>
      </el-form-item>
      <el-form-item><el-link :underline="false" @click="toggleForm">去注册 →</el-link> </el-form-item>
    </el-form>
    <el-form v-else size="large" :model="formModel" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item><h1 class="login-title">注册</h1></el-form-item>
      <el-form-item prop="username">
        <el-input v-model="formModel.username" :prefix-icon="User" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item prop="email">
        <el-input v-model="formModel.email" :prefix-icon="Message" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="formModel.password" :prefix-icon="Lock" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input v-model="formModel.confirmPassword" :prefix-icon="Lock" placeholder="请确认密码" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" block @click="onRegister">注册</el-button>
        <el-form-item><el-link :underline="false" @click="toggleForm">去登录 →</el-link></el-form-item>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 20px;
  margin-top: 100px;
  box-sizing: border-box;
}
.login-title {
  width: 100%;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.el-form {
  width: 400px;
}
.el-button {
  width: 100%;
}
</style>