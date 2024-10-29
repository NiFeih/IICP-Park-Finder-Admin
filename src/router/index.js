import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    
    {
      path:'/register',
      name:'register',
      component:() => import('@/views/RegisterView.vue')
    },
    {
      path:'/login',
      name:'login',
      component:() => import('@/views/LoginView.vue')
    },
    {
      path:'/home',
      name:'home',
      component:()=>import('@/views/Homeview.vue')
    },
    {
      path:'/searchCarPlate',
      name:'searchCarPlate',
      component:()=>import('@/views/SearchCarPlateView.vue')
      
    },
    {
        path:'/',
        redirect:'/home',
        component:()=>import(`@/layouts/DefaultLayout.vue`),
        children:[
            {
              path:'/home',
              name:'home',
              component:()=>import('@/views/Homeview.vue')
            },
            {
              path:'/searchCarPlate',
              name:'searchCarPlate',
              component:()=>import('@/views/SearchCarPlateView.vue')
              
            },
            {
              path:'/ownerDetails/:carPlate',
              name:'ownerDetails',
              component:()=>import('@/views/OwnerDetailsView.vue')
            }
          
        ]
      
    }


  ]
})

router.beforeEach((to, from, next) => {
  next()
});

export default router
