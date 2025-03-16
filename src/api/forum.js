import request from '@/utils/request'
//获取帖子列表
export const getForumListServe = (params) => request.get('/api/forum/posts', {params})
//发帖接口
export const postForumServe = (data) => request.post('/api/forum/posts', data, {headers: { 'Content-Type': 'multipart/form-data' }})
//点赞帖子接口
export const likeForumServe = (postId) => request.post(`/api/forum/posts/${postId}/like`)

//删除帖子接口
export const deleteForumServe = (postId) => request.delete(`/api/forum/posts/${postId}`)
//获取帖子回复
export const getForumReplyServe = (postId) => request.get(`/api/forum/posts/${postId}/replies`)

//回复帖子
export const postForumReplyServe = (postId, content) => request.post(`/api/forum/posts/${postId}/replies`, {content})

//删除帖子回复
export const deleteForumReplyServe = (replyId) => request.delete(`/api/forum/posts/replies/${replyId}`)