<script setup lang="ts">
  // https://github.com/vueuse/head
  // you can use this to manipulate the document head in any components,
  // they will be rendered correctly in the html results with vite-ssg
  useHead({
    title: 'Dropper',
    meta: [
      { name: 'description', content: 'Opinionated Vite Starter Template' },
      {
        name: 'theme-color',
        content: () => isDark.value ? '#00aba9' : '#ffffff',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: () => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg',
      },
    ],
  })
  import { useUserStore } from '~/stores/user'
  import { useApiStore } from "~/stores/api"
  import { useLoggerStore } from "~/stores/logger";
  import { useRouter } from "vue-router";

  const User = useUserStore()
  const Api = useApiStore()
  //const Logger = useLoggerStore()
  const Router = useRouter()

  // first time open
  Api.init().then( () => {
    // this activates the beforeEach (we hope)
    Router.push(Router.currentRoute)
    // Logger.log('restore session')
    // debugger
    // if (!User.hasUrlAccess(Router.currentRoute.value.path)) {
    //   Logger.log('redirect to login', Router.currentRoute.value.path)
    //   Router.push('/user/loginXXX')
    // } else {
    //   Logger.log('restore session')
    // }
  })
  // route change
  Router.beforeEach((to) => {
    //debugger
    // Logger.log(to.meta.protect)
    if (to.meta.rights === 'public') {
      return true
    }
    if (!User.hasUrlAccess(to.path)) {
      //debugger
      Router.push('/user/login')
      return false
    }
    return true
  })

</script>

<template>
  <RouterView />
</template>
