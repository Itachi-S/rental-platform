<template>
  <div class="profile-page">
    <el-row class="profile-content">
      <!-- 左侧导航栏 -->
      <el-col :lg="4" :md="4" :sm="4" :xs="4" class="sidebar">
        <el-menu :default-active="$route.path" :router="true" class="el-menu-vertical-demo">
          <el-menu-item index="/profile/userinfo">基本信息</el-menu-item>
          <el-menu-item index="/profile/userorders">个人订单</el-menu-item>
        </el-menu>
      </el-col>

      <!-- 右侧内容区域 -->
      <el-col :lg="16" :md="20" :sm="20" :xs="20" class="content">
        <router-view></router-view>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
</script>

<style scoped>
.profile-page {
  display: flex;
  min-height: 100vh; /* 设置最小高度为视口高度 */
}

.profile-content {
  width: 100%;
  display: flex; /* 使用 Flexbox 布局 */
}

.sidebar {
  padding: 20px;
  background-color: #f4f4f4;
  flex: 0 0 auto; /* 不伸缩 */
}

.content {
  padding: 20px;
  flex: 1; /* 占据剩余空间 */
}

.el-menu-vertical-demo {
  width: 100%;
  height: 100%;
  background-color: #f4f4f4;
}

.el-menu-item {
  cursor: pointer;
}

/* 媒体查询，当屏幕宽度小于等于 768px 时（通常认为是移动端） */
@media (max-width: 768px) {
  .sidebar,
  .content {
    padding: 0;
  }
  .el-menu-vertical-demo .el-menu-item {
    padding: 5px !important;  
  }
}
</style>