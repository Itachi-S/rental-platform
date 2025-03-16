<template>
  <div class="post-detail-container">
    <!-- 帖子详情展示 -->
    <el-card shadow="hover" class="post-item">
      <div class="post-header">
        <el-avatar :src="postDetails.avatar" size="large" />
        <span class="post-username">{{ postDetails.username }}</span>
      </div>

      <div class="post-content">
        <h2>{{ postDetails.title }}</h2>
        <p>{{ postDetails.content }}</p>

        <!-- 多张图片展示 -->
        <div v-if="postDetails.images && postDetails.images.length > 0" class="post-images">
          <el-image
            v-for="(image, index) in postDetails.images"
            :key="index"
            :src="image"
            fit="cover"
            class="post-image"
          />
        </div>
      </div>

      <div class="post-footer">
        <span class="post-date">{{ postDetails.createdAt }}</span>
        <div class="post-actions">
          <!-- 点赞按钮 -->
          <el-link
            :class="postDetails.isLiked ? 'iconfont icon-aixin1' : 'iconfont icon-aixin'"
            @click.stop="toggleLikePost(postDetails.postId)"
            :underline="false"
          >
            <p style="font-size: 14px;">{{ postDetails.likes }}</p>
          </el-link>

          <!-- 评论按钮 -->
          <el-link
            @click="goToReply()"
            :underline="false"
            :icon="ChatDotRound"
          >
            <p style="font-size: 14px;">{{ postDetails.commentCount }}</p>
          </el-link>

          <!-- 分享按钮 -->
          <el-link
            @click.stop="sharePost"
            :underline="false"
            :icon="Share"
          ></el-link>

          <!-- 删除按钮（仅作者可见和管理员） -->
          <el-link 
              v-if="postDetails.username === userStore.username || userStore.role === 'admin'" 
              @click.stop="deletePost(postDetails.postId)" 
              :underline="false" 
              :icon="Delete"
              :style="{ color: postDetails.username === userStore.username ? '#409eff' : '#e6a23c' }">
            </el-link>
        </div>
      </div>
    </el-card>

    <!-- 评论区 -->
    <div class="reply-section">
      <h3>用户评论</h3>
      <el-row v-if="replies.length > 0">
        <el-col v-for="(reply, index) in replies" :key="index" :span="24">
          <div class="reply-item">
            <div class="reply-header">
              <el-avatar :src="reply.avatar" size="medium"/>
              <strong class="username">{{ reply.username }}</strong>
              <p class="reply-date">{{ reply.createdAt }}</p>
            </div>
            <p class="reply-content">{{ reply.content }}</p>
            <el-link 
            v-if="reply.username === userStore.username" 
            @click.stop="deleteReply(reply.replyId)" 
            :underline="false" 
            :icon="Delete"
            style="color: #409eff;"></el-link>
          </div>

        </el-col>
      </el-row>

      <!-- 无评论提示 -->
      <el-row v-else>
        <el-col :span="24">
          <p>暂无评论，赶快成为第一个评论的人！</p>
        </el-col>
      </el-row>

      <!-- 评论输入框 -->
      <div class="submit-reply">
        <h3>发表您的评论</h3>
        <el-input
          v-model="newreply"
          placeholder="请输入您的评论"
          type="textarea"
          rows="4"
        ></el-input>
        <el-button
          type="primary"
          @click="submitreply"
          :loading="loading"
          class="submit-reply-btn"
        >
          提交评论
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { usePostStore, useUserStore } from '@/stores'
import { getForumReplyServe, deleteForumServe, likeForumServe, postForumReplyServe, deleteForumReplyServe } from '@/api/forum'
import { ChatDotRound, Delete, Share } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format_datetime'

const postStore = usePostStore()
const router = useRouter()
const userStore = useUserStore()
const replies = ref([])
const newreply = ref('')
const loading = ref(false)
let socket = null
// 获取帖子详情
const postDetails = postStore.postDetail

// 如果用户直接访问详情页，但没有缓存数据，则跳回主页
onMounted(() => {
  if (!postDetails) {
    router.push('/') 
  } else {
    fetchReplies()
  }
  // 建立 WebSocket 连接，监听点赞变化
  connectWebSocket()
})

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
    if (postDetails) {
      postDetails.likes = data.likes
      postDetails.isLiked = data.isLiked
    }
  }

  socket.onclose = () => {
    console.warn('WebSocket 已断开')
    setTimeout(() => connectWebSocket(), 1000)
  }
}
// 获取评论
const fetchReplies = async () => {
  const { data } = await getForumReplyServe(postDetails.postId)
  console.log('获取评论', data)
  replies.value = data.replies ? data.replies.map(reply => {
    reply.createdAt = formatDate(reply.createdAt)
    return reply
  }) : []
}

//tiao跳到评论区
const goToReply = () => {
  const repliesection = document.querySelector('.reply-section')
  if (repliesection) {
    repliesection.scrollIntoView({ behavior: 'smooth' })
  }
}
// 提交评论
const submitreply = async () => {
  if (!newreply.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  loading.value = true
  const {data} = await postForumReplyServe(postDetails.postId, newreply.value)
  console.log(data)
  newreply.value = ''
  fetchReplies()
  loading.value = false

}

//删除评论
const deleteReply = async (replyId) => {
  await ElMessageBox.confirm(
    '你确认要删除此评论吗?',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  await deleteForumReplyServe(replyId)
  fetchReplies()
  ElMessage.success('删除成功')
}
// 点赞帖子
const toggleLikePost = async (id) => {
  const { data } = await likeForumServe(id)
  console.log('点赞帖子', data)
  // 立刻更新前端点赞状态
  if (postDetails) {
    postDetails.likes = data.likes
    postDetails.isLiked = data.isLiked


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
  router.push('/forum')

}

// 分享帖子
const sharePost = () => {
  navigator.clipboard.writeText(window.location.href)
  ElMessage.success('帖子链接已复制')
}
</script>
<style scoped>
.post-detail-container {
  width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
}

/* 头部信息 */
.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.post-username {
  font-weight: bold;
  font-size: 16px;
}

/* 帖子内容 */
.post-content {
  margin-bottom: 20px;
}

.post-content p {
  line-height: 1.6;
}

/* 图片展示 */
.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.post-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
}

/* 操作按钮 */
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

/* 评论区 */
.reply-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 15px 0;
}

.reply-header {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reply-date {
  color: #999;
  font-size: 12px;
}

/* 评论输入框 */
.submit-reply {
  margin-top: 20px;
}

.submit-reply-btn {
  margin-top: 10px;
}
</style>