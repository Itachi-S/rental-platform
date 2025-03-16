import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
import Layout from '@/views/layout/LayoutPage.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/login/:isLogin?', name:'login', component: () => import('@/views/login/LoginPage.vue')
    },
    {
      path: '/',
      component: Layout,
      redirect: '/home',
      children: [
        {
          path: '/home',
          name: 'Home',
          component: () => import('@/views/home/index.vue'),
          meta: { title: '首页', icon: 'home-filled' }
        },
        {
          path: '/forum',
          name: 'ForumPage',
          component: () => import('@/views/forum/ForumPage.vue'),
          meta: { title: '论坛', icon: 'chat-line-round' }
        },
        {
          path: '/postdetail',
          name: 'PostDetail',
          component: () => import('@/views/forum/ForumPostDetail.vue'),
          meta: { title: '帖子详情', hidden: true }
        },
        {
          path: '/vehicles',
          name: 'VehicleList',
          component: () => import('@/views/vehicle/VehicleList.vue'),
          meta: { title: '车辆列表', icon: 'van' }
        },
        {
          path: '/vehicles/:carId',
          name: 'VehicleDetail',
          component: () => import('@/views/vehicle/VehicleDetail.vue'),
          meta: { title: '车辆详情', hidden: true }
        },
        {
          path: '/order',
          name: 'OrderPage',
          component: () => import('@/views/order/OrderPage.vue'),
          meta: { title: '我的订单', icon: 'document' }
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('@/views/user/ProfilePage.vue'),
          redirect: '/profile/userinfo',
          children: [
            {
              path: 'userinfo',
              name: 'UserInfo',
              component: () => import('@/views/user/UserInfo.vue')
            },
            {
              path: 'userorders',
              name: 'UserOrders',
              component: () => import('@/views/user/UserOrders.vue')
            }
          ]
        },
        {
          path: '/manage',
          name: 'ManagePage',
          component: () => import('@/views/manage/ManagePage.vue'),
          meta: { title: '管理', icon: 'setting' },
          children: [
            {
              path: 'managevehicle',
              name: 'ManageVehicle',
              component: () => import('@/views/manage/ManageVehicle.vue'),
              meta: { title: '车辆管理' }
            },
            {
              path: 'manageorders',
              name: 'ManageOrders',
              component: () => import('@/views/manage/ManageOrders.vue'),
            }
          ]
        }
      ]
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  }
  
})
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 需要管理员权限的路由
  const adminRoutes = ['/manage', '/manage/managevehicle', '/manage/manageorder']

  if (adminRoutes.includes(to.path) && userStore.role !== 'admin') {
    return next({ path: '/' }) // 如果不是管理员，重定向到首页或其他页面
  }

  next() // 允许正常跳转
})

export default router
