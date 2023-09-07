import { acceptHMRUpdate, defineStore } from 'pinia'
import wcMatch from 'wildcard-match'
import {computed, reactive, ref} from "vue";
import {useLoggerStore} from "~/stores/logger";
import {IApiResult, ILoginResult, useApiStore} from "~/stores/api";

// import {useCookie} from '@vueuse/integrations/useCookies'

export interface IUserConfig  {
  isLoggedIn?: boolean
  username?: string
  email?: string,
  urlAccess?: [string],
  urlMatch?: [any]
}

export interface IUserStore {
  create(user: IUserConfig) : Promise<IApiResult>
  logoff(): Promise<void>
  login(user: IUserConfig) : Promise<boolean>
  hasUrlAccess(url: string): boolean

  isLoggedIn: boolean
  username: string
  email: string,
  userConfig: IUserConfig
  genMailKey(string): Promise<string>
  usernameUnique(string): Promise<boolean>
}

export const useUserStore : IUserStore = defineStore('user', () => {
  const userConfig = reactive({isLoggedIn: false, username: '', email: '', urlAccess: [], urlMatch: []} as IUserConfig)

  const isLoggedIn  = ref(false)
  const username = computed(() => userConfig.username)
  const email = computed(() => userConfig.email)
  const urlMatchGlobal = _compileMatch(['/', '/index', '/user/login', '/user/create', '/about']) // global allowed urls
  const urlMatchUser = _compileMatch(['/projects*']) // global allowed urls

  function _clear() {
    isLoggedIn.value = false;
    userConfig.username = 'anon'
    userConfig.email = 'anon@example.com'
    userConfig.urlAccess =  []  // should be only login and root
    userConfig.urlMatch = []
  }
  function _set(values: IUserConfig) {
    userConfig.username = values.username || userConfig.username
    userConfig.email = values.email || userConfig.email
    userConfig.urlAccess = values.hasOwnProperty('urlAccess') ? values.urlAccess : userConfig.urlAccess
    userConfig.urlMatch = _compileMatch(userConfig.urlAccess)
    const Api = useApiStore()
    isLoggedIn.value = Api.isLoggedIn
  }

  function _compileMatch(filters) {
    let result = []
    for (let index = 0; index < filters.length; index++) {
      result.push(wcMatch(filters[index]))
    }
    return result;
  }
  /**
   * set the current account to anon
   */
  function logoff() {
    _clear()
    const Api = useApiStore()
    Api.logoff()
  }
  _clear()

  /**
   * create a new user
   * @param user IUserConfig
   * @return true if user is created
   */
  async function create(user: IUserConfig) : Promise<boolean> {
    const Logger = useLoggerStore()
    Logger.log('creating user', user)
    let Api = useApiStore()
    try {
      let result = await Api.post('auth/create', user)
      if (result.isError) {
        Api.logoff()
        throw new Error(result.message)
      }
      Logger.log('create', result)
      Api.login(result.body as ILoginResult)
      _set(result)
    } catch (e) {
      Api.logoff()
      throw new Error(e.message)
    }
    return true
  }

  async function login(user: IUserConfig): Promise<boolean> {
    const Logger = useLoggerStore()
    Logger.log('login user', user)
    let Api = useApiStore()
    try {
      let result = await Api.post('auth', user)
      if (result.isError) {
        Api.logoff()
        throw new Error(result.message)
      }
      Api.login(result.body as ILoginResult)
      _set(result)
    } catch (e) {
      Api.logoff()
      throw new Error(e.message)
    }
    return true
  }
  /**
   * user logged in, setting default values
   * @param userRecord
   */
  function loggedIn(userRecord) {
    _set(userRecord.user)
    isLoggedIn.value = true
  }

  function _hasAccess(urlMatch, url) {
    for (let accessIndex = 0; accessIndex < urlMatch.length; accessIndex++) {
      if (urlMatch[accessIndex](url)) {
        return true
      }
    }
//    console.log('no access to ', url)
    return false;
  }
  /**
   * check if the user has access to a specific url
   * @param url
   * @returns Boolean
   */
  function hasUrlAccess(url): boolean {
    // debugger
    if (isLoggedIn && _hasAccess(urlMatchUser, url)) {
      // standard user
      return true
    } else if (_hasAccess(userConfig.urlMatch, url)) {
      // for special by user
      return true
    } else if (_hasAccess(urlMatchGlobal, url)) {
      // everybody is allowed
      return true
    }
    return false;
  }

  /**
   * generate a mailKey for testing
   * @param email
   * @throws Error (network)
   */
  async function genMailKey(email) : Promise<string> {
    let api = useApiStore()
    let result = await api.get('auth/key', {
      email,
      unique: true
    })
    if (result.isError) {
      throw new Error(result.message)
    }
    return result.body.key
  }

  async function usernameExists(username): Promise<boolean> {
    let api = useApiStore()
    let result = await api.post('auth/username', {username})
    if (result.isError) {
      throw new Error(result.message)
    }
    return result.body.exists
  }

  return {
    create,
    login,
    logoff,
    hasUrlAccess,

    isLoggedIn,
    username,
    email,
    userConfig,

    genMailKey,
    usernameExists,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
