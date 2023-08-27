<script lang="ts" setup>
  import { useApiStore }from "~/stores/api"

  const api = useApiStore()
  const email = ref('')
  const password = ref('')
  const remember = ref(true)
  const error = ref('')

  const doLogin = async () => {
    try {
      error.value = ''
      let result = await api.login(email.value, password.value)
      if (result.isError) {
        error.value = result.message
      } else {
//        debugger
        console.log(result)
      }
    } catch(e) {
      error.value = e.message
    }
  }
</script>

<template>
  <div class="border border-indigo-600 p-5 rounded-md">
    <h2 class="mb-12 text-3xl font-bold">Create a new account</h2>

    <div role="alert" v-show="error.length" class="mb-6">
      <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
        Error
      </div>
      <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
        <p>{{ error }}</p>
      </div>
    </div>

    <form class="" @submit.prevent="doLogin" >
      <d-text class="mb-6" v-model="email" label="Type your email address" name="email" > </d-text>
      <d-text v-model="password" placeholder="username" name="name" label="Password"></d-text>
      <d-checkbox v-model="remember" label="Remember me" explain="Easy login the next time"/>
      <div class="w-full text-center">
        <d-button layout="btn-primary" >Login</d-button>
        <d-button url="/">Cancel</d-button>
      </div>


      The email is {{ email }} this {{username}} {{ remember }}
    </form>
  </div>
</template>
<style scoped>

</style>

<route lang="yaml">
  meta:
    layout: dialog
    rights: public
</route>
