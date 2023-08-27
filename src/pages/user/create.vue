<script lang="ts" setup>
  import {useRoute, useRouter} from "vue-router"
  import {IUserLogin} from "~/stores/config"
  import {useLoggerStore} from "~/stores/logger"
  import {useUserStore} from "~/stores/user"

  const Logger = useLoggerStore()
  const Router = useRouter()
  const user: IUserLogin = reactive({
    email: '',
    username: '',
    password: '',
    mailKey: ''
  })
  const error = ref('')
  const usernameError = ref('')
  const passwordError = ref('')
  const state = ref('init')
  const password2 = ref('')

  /**
   * send email to the server to get valided
   */
  const onSubmit = async () => {
    error.value = ''
    user.mailKey = ''
    let User = useUserStore()
    try {
      user.mailKey = await User.genMailKey(user.email)
      state.value = 'send'
    } catch (e) {
      error.value = e.message
    }
  }

  const sendIt = async() => {
    state.value = 'account'
  }

  /**
   * checks the user does not already exists
   */
  const validateUser = async() => {
    error.value = ''
    usernameError.value = ''
    let User = useUserStore()
    try {
      if (await User.usernameExists(user.username)) {
        usernameError.value = 'user already exists'
      }
    } catch (e) {
      usernameError.value = e.message
    }
  }
  /**
   * check the password are equal
   */
  const validatePasswords = async() => {
    passwordError.value = ''
    if (user.password.length > 0 && password2.value.length > 0) {
      if (user.password !== password2.value) {
        passwordError.value = 'password do not match'
      }
    }
  }

  const _clearErrors = () => {
    error.value = ''
    usernameError.value = ''
    passwordError.value = ''
  }
  const _validate = async () => {
    await validateUser()
    await validatePasswords()
  }
  const _hasError = () => {
    return error.value.length > 0 || usernameError.value.length > 0 || passwordError.value.length > 0
  }

  /**
   * request the server to create a user with this account
   */
  const onCreateUser = async() => {
    _clearErrors()
    await _validate()
    if (_hasError()) {
      return
    }
    try {
      let User = useUserStore()
      // ToDo
      // should be remove in the production version
      if (!user.mailKey || user.mailKey.length === 0) {
        user.mailKey = await User.genMailKey(user.email)
        Logger.log('Mailkey', user.mailKey)
      }
      // end
      let result = await User.create(user)
      if (result.isError) {
        error.value = result.message
      } else {
        Router.push('/projects')
      }
    } catch (e) {
      error.value = e.message
    }
  }

  /**
   * if called direct from the mail, they key is part of the url
   */
  const route = useRoute()
  if (route.query.key) {
    Logger.log('found key ' + route.query.key)
    state.value = 'account'
  } else {
    Logger.log('no key', route.path)
  }
</script>

<template>
  <div class="border border-indigo-600 p-5 rounded-md">
    <div role="alert" v-show="error.length" class="mb-6">
      <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
        Error
      </div>
      <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
        <p>{{ error }}</p>
      </div>
    </div>
    <h2 class="mb-12 text-3xl font-bold">Create a new account</h2>
    <div v-if="state === 'init'">
      <form class="" @submit.prevent="onSubmit">
        <d-text class="mb-6" v-model="user.email" label="Type your email address" name="email" > </d-text>
        <div class="w-full text-center">
          <d-button layout="btn-primary" submit >Create</d-button>
          <d-button >Cancel</d-button>
        </div>
        The email is {{ user.email }} this {{user.username}} {{ remember }}
      </form>
    </div>

    <div v-if="state === 'send'">
      <p>An email has been send to {{ user.email }}. Please Follow the instructions.</p>
      <br/>
      <p>Happy Dropping</p>
      <p>for now  to continu the process <d-button @click="sendIt">here</d-button>. This link is in the email send to the user</p>
    </div>

    <div v-if="state === 'account'">
      <p>Welcome to Dropper</p>
      <p>please setup your account</p>
      <form class="" @submit.prevent="onCreateUser">

        <d-text class="mb-6"
                v-model="user.username"
                label="Username"
                name="username"
                :validation-error="usernameError"
                @blur="validateUser()" />

        <d-text class="mb-6"
                v-model="user.password"
                label="Password"
                type="password"
                @blur="validatePasswords()"
                name="password" />
        <d-text class="mb-6"
                v-model="password2"
                label="Repeat Password"
                name="password2"
                :validation-error="passwordError"
                @blur="validatePasswords()"
                type="password" />
        <div class="w-full text-center">
          <d-button layout="btn-primary" submit >Create Account</d-button>
        </div>
      </form>
    </div>
  </div>
</template>
<style scoped>

</style>

<route lang="yaml">
meta:
  layout: dialog
  rights: public
</route>
