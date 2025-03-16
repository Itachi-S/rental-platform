<script setup>
import { UserFilled } from '@element-plus/icons-vue'
import { ref } from 'vue' 
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
const userStore = useUserStore()
const router = useRouter()
// 登录状态
const isLoggedIn = ref(!!userStore.token) 
const handleCommand = (key) => {
  // 退出登录
  if (key === 'logout') {
    userStore.removeInfo()
    router.push('/login')
  }
  if (key === 'profile') {
    router.push('/profile')
  }
  if (key === 'manage') {
    router.push('/manage')
  }
}
</script>

<template>
  <div class="main-layout">
    <!-- 头部导航 -->
    <header class="app-header">
      <div class="container">
        <el-row justify="space-evenly" align="middle">
          <el-col :span="4">
            <router-link to="/" class="logo">
              <img src="@/assets/logo.png" alt="租车平台">
            </router-link>
          </el-col>
          <el-col :span="14">
            <el-menu 
              mode="horizontal" 
              ellipsis="false"
              :default-active="$route.path"
              :router="true"
              class="nav-menu"
            >
              <el-menu-item index="/home">首页</el-menu-item>
              <el-menu-item index="/forum">论坛</el-menu-item>
            </el-menu>
          </el-col>
          <el-col :span="4" class="user-area">
            <el-dropdown v-if="isLoggedIn" @command="handleCommand">
              <span class="el-dropdown-link">
                          <el-avatar v-if="userStore.avatar" :src="userStore.avatar" />
                          <el-avatar v-else icon="UserFilled" />
                          <span>{{ userStore.username }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.role === 'admin'" command="manage">管理中心</el-dropdown-item>
                  <el-dropdown-item command="logout">退出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <div v-else class="auth-links">  <!-- 新增 -->
              <router-link to="/login" class="login-link">登录</router-link>
              <span class="divider">|</span>
              <router-link :to="`/login/${false}`" class="register-link">注册</router-link>
            </div>
          </el-col>
        </el-row>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="app-main">
      <router-view v-slot="{ Component }" :key="$route.fullPath">
        <transition name="fade-transform" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部信息 -->
    <footer class="app-footer">
      <div class="container">
        <el-row :gutter="20">
          <el-col :md="6">
            <h3>关于我们</h3>
            <p>24小时客服：400-888-8888</p>
          </el-col>
          <el-col :md="6">
            <h3>服务保障</h3>
            <p>全程保险</p>
            <p>车辆消毒</p>
          </el-col>
          <el-col :md="6" class="qrcode-area">
            <img src="@/assets/wechat-qrcode.jpg" alt="微信公众号">
          </el-col>
        </el-row>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;

  .logo img {
    height: 40px;
  }

  .nav-menu {
    border-bottom: none;
    justify-content: center;
  }

  .user-area {
    text-align: right;

    .el-dropdown-link {
      display: flex;
      align-items: center;
    }
  }
}

.app-main {
  margin-top: 60px;
  min-height: calc(100vh - 160px);
  background-color: #f0f0f0;
}

.app-footer {
  background: #2c3e50;
  color: #fff;
  padding: 40px 20px;
  
  h3 {
    color: #fff;
    margin-bottom: 15px;
  }
  
  .qrcode-area img {
    width: 120px;
  }
}
.auth-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  
  .divider {
    color: #ccc;
  }
  
  a {
    color: #666;
    text-decoration: none;
    &:hover {
      color: #409eff;
    }
  }
}

</style>