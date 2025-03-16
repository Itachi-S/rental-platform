<template>
  <div class="post-list-container">
    <!-- 顶部工具栏，包括排序选择框、搜索框和发帖按钮 -->
    <div class="toolbar">
      <el-select v-model="sortOption" placeholder="排序" class="sort-select">
        <el-option label="最新发布" value="newest" />
        <el-option label="最热帖子" value="most_liked" />
        <el-option label="我的帖子" value="my_posts" />
      </el-select>
      <div class="search-box">
        <el-input v-model="searchQuery" placeholder="搜索帖子..." />
        <el-button class="search-btn" type="primary" @click="searchPosts">搜索</el-button>
      </div>
      <el-button type="primary" @click="openPostDrawer">发帖</el-button>
    </div>

    <!-- 帖子列表 -->
    <template v-if="filteredPosts.length > 0">
      <el-card v-for="post in filteredPosts" :key="post.id" shadow="hover" class="post-item">
        <div class="post-header">
          <el-avatar :src="post.avatar" size="large" />
          <span class="post-username">{{ post.username }}</span>
        </div>
        <div class="post-content" @click="goToPost(post)">
          <h2>{{ post.title }}</h2>
          <p>{{ post.content }}</p>
          <!-- 多张图片展示 -->
          <div v-if="post.images && post.images.length > 0" class="post-images">
            <el-image
              v-for="(image, index) in post.images"
              :key="index"
              :src="image"
              fit="cover"
              class="post-image"
            />
          </div>
        </div>
        <div class="post-footer">
          <span class="post-date">{{ post.createdAt }}</span>
          <div class="post-actions">
            <el-link
             :class="post.isLiked ? 'iconfont icon-aixin1' : 'iconfont icon-aixin'" 
             @click.stop="toggleLikePost(post.postId)" 
             :underline="false">
             <p style="font-size: 14px;">{{ post.likes }}</p> 
            </el-link>
            <el-link @click="goToPost(post)" :underline="false" :icon="ChatDotRound">
              <p style="font-size: 14px;">{{ post.commentCount }}</p>
            </el-link>
            <el-link @click.stop="sharePost(post)" :underline="false" :icon="Share"></el-link>
            <el-link 
              v-if="post.username === userStore.username || userStore.role === 'admin'" 
              @click.stop="deletePost(post.postId)" 
              :underline="false" 
              :icon="Delete"
              :style="{ color: post.username === userStore.username ? '#409eff' : '#e6a23c' }">
            </el-link>
          </div>
        </div>

      </el-card>
    </template>

    <!-- 当搜索结果为空时，显示提示 -->
    <el-card v-else class="post-item empty-card">
      <div style="height: 100px;" class="post-header"></div>
      <div class="post-content">
        <h2>找不到内容</h2>
        <p>请尝试更换关键词或发布新帖子。</p>
      </div>
    </el-card>

    <!-- 发帖抽屉组件 -->
    <el-drawer v-model="drawerVisible" title="发布帖子" size="50%">
      <el-form :model="newPost">
        <el-form-item label="标题">
          <el-input v-model="newPost.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="newPost.content" type="textarea" />
        </el-form-item>
        <el-form-item label="上传图片">
          <!-- 图片上传组件，支持多张图片 -->
          <el-upload
            v-model:file-list="fileList"
            :auto-upload="false"
            list-type="picture-card"
            :on-remove="handleRemove"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitPost">提交</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, ChatDotRound, Share, Delete } from '@element-plus/icons-vue'
import { likeForumServe, postForumServe, deleteForumServe } from '@/api/forum'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getForumListServe } from '@/api/forum'
import { formatDate } from '@/utils/format_datetime'
import { useUserStore, usePostStore } from '@/stores'

const posts = ref([])
const searchQuery = ref('')
const sortOption = ref('newest')
const drawerVisible = ref(false)
const newPost = ref({ title: '', content: '', images: [] })
const fileList = ref([])
const searchedPosts = ref([])
const router = useRouter()
const userStore = useUserStore()
const postStore = usePostStore()
let socket = null

// 计算排序后的帖子列表
const filteredPosts = computed(() => {
  let filtered = [...searchedPosts.value]

  if (sortOption.value === 'most_liked') {
    return filtered.sort((a, b) => b.likes - a.likes)
  } else if (sortOption.value === 'my_posts') {
    return filtered.filter(post => post.username === userStore.username)
  }
  return filtered
})

// 执行搜索
const searchPosts = () => {
  if (!searchQuery.value.trim()) {
    searchedPosts.value = posts.value // 关键字为空时恢复所有帖子
  } else {
    searchedPosts.value = posts.value.filter(post => post.title.includes(searchQuery.value))
  }
}

onMounted(() => {
  fetchPosts()
  // 建立 WebSocket 连接，监听点赞变化
  connectWebSocket()
})

// 获取帖子列表
const fetchPosts = async () => {
  const { data } = await getForumListServe()
  posts.value = data.posts ? data.posts.map(post => {
    post.createdAt = formatDate(post.createdAt)
    post.images = post.images.map(image => 'http://localhost:3000' + image)
    return post
  }) : []
  // console.log('帖子列表', data)
  searchedPosts.value = posts.value
  // console.log(searchedPosts.value)
}

const connectWebSocket = () => {
  socket = new WebSocket('ws://localhost:3000')

  socket.onopen = () => {
    console.log('WebSocket 已连接')
  }

  // 监听服务器推送的点赞变化
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)

    // 避免重复更新UI
    if (data.userId === userStore.userId) {
      // 如果是自己点赞，不更新UI，因为前面点击按钮已经更新了
      return
    }

    // 更新其他用户的点赞状态
    const post = posts.value.find(p => p.postId === data.postId)
    if (post) {
      post.likes = data.likes
      post.isLiked = data.isLiked
    }
  }

  socket.onclose = () => {
    console.warn('WebSocket 已断开')
    setTimeout(() => connectWebSocket(), 1000)
  }
}

// 跳转到帖子详情页
const goToPost = (post) => {
  postStore.setpostDetail(post)
  router.push({path: '/postdetail'})
}

// 点赞帖子
const toggleLikePost = async (id) => {
  const { data } = await likeForumServe(id)
  console.log('点赞帖子', data)
  // 立刻更新前端点赞状态
  const post = searchedPosts.value.find(p => p.postId === id)
  if (post) {
    post.likes = data.likes
    post.isLiked = data.isLiked
  }

  // 立即同步WebSocket，防止其他用户感知不到点赞变化
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'like_change',
      postId: id,
      likes: data.likes,
      isLiked: data.isLiked,
      userId: userStore.userId // 推送给所有客户端，包括自己
    }))
  }
}

// 分享帖子
const sharePost = (post) => {
  console.log('分享帖子', post.id)
}

// 删除帖子
const deletePost = async (postId) => {
  await ElMessageBox.confirm(
    '你确认要删除此帖子吗?',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  await deleteForumServe(postId)
  ElMessage.success('删除成功')
  fetchPosts()

}
// 打开发帖抽屉
const openPostDrawer = () => {
  drawerVisible.value = true
}

const handleRemove = (file) => {
  fileList.value = fileList.value.filter(item => item.uid !== file.uid)
}

//发布帖子
const submitPost = async () => {
  const formData = new FormData()
  formData.append('title', newPost.value.title)
  formData.append('content', newPost.value.content)

  fileList.value.forEach(file => {
    formData.append('images', file.raw)
  })
  const { data } = await postForumServe(formData)
  ElMessage.success('帖子发布成功')
  drawerVisible.value = false
  fetchPosts()
}
</script>



<style scoped>
.post-list-container {
  max-width: 800px;
  margin: auto;
  padding: 0 20px;
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  background-color: #fff;
}

:deep(.el-select__wrapper),
:deep(.el-select__wrapper:hover) {
  box-shadow: none;
}
.sort-select {
  width: 150px;
  box-shadow: none;
  border-radius: 0%;
}
.search-box {
  display: flex;
  flex-grow: 1;
  margin: 0 50px;
  .search-btn {
    border-radius: 0 4px 4px 0;
  }
}

/* 帖子卡片样式 */
.post-item {
  cursor: pointer;
  transition: 0.3s;
  border-radius: 0%;
  border: none;
}
.post-header {
  display: flex;
  align-items: center;
  padding: 10px;
  .post-username{
    margin-left: 10px;
  }
}
.empty-card {
  text-align: center;
  color: #999;
}
/* 图片展示区域 */
.post-images {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

.post-image {
  width: 100px;
  height: 100px;
  border-radius: 5px;
  object-fit: cover;
}
.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .post-date {
    font-size: 13px;
    color: #999;
  }
  .post-actions{
    display: flex;
    gap: 10px;
    .el-link{
      font-size: 20px;
    }
  }
  /*已点赞样式 */
  .icon-aixin1 {
    color: #ed4242;
    transform: scale(1.1);
  }
}

</style>
