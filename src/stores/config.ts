import { acceptHMRUpdate, defineStore } from 'pinia'
import {computed} from "vue";
import pkg from '../../package.json'
const {version} = pkg

export interface IUserLogin {
  username: string
  password: string
  email: string
  mailKey?: string
}
export interface IConfigStore {
  appVersion: string
  apiServer: string
  user: IUserLogin
}

export const useConfigStore: IConfigStore = defineStore('configuser', () => {
  /**
   * Current name of the user.
   */
 const appVersion = computed(() => {
    return version
  })

  return {
    appVersion,       // global version
    apiServer: 'http://localhost:3060/api/',  // server dev or production
    user: {
      username: 'Test user',
      email: 'frontend@dropper.org',
      password: '123456'
    }
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useConfigStore, import.meta.hot))
