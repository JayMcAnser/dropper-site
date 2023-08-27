import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed } from 'vue';
import fetch from 'cross-fetch'
import {useConfigStore, IUserLogin} from "./config";
import {IUserStore, useUserStore} from './user'
import {useCookies} from "@vueuse/integrations/useCookies";

export interface IApiResult {
  isError: boolean,
  status: number,
  message?: string,
  body?: any,
  error?: Error
}

export interface IFetchOptions {
  asBlob: boolean
  contentType: string
}

export interface IApiStore {
  isLoggedIn: boolean
  // the login for the system
  login(usr: IUserLogin): boolean
  logoff(): void
  refreshToken: string
  info: any
  post(url: string, body: any, options: IFetchOptions): IApiResult
  get(url: string, body: any, options: IFetchOptions): IApiResult
  init(): Promise<void>
}

export const useApiStore: IApiStore = defineStore('api', () => {
  const Config = useConfigStore()
  const User : IUserStore = useUserStore()
  const REFRESH_TOKEN = 'refreshToken'
  const Cookies = useCookies([REFRESH_TOKEN])


  const JWT = ref('')
  let RefreshToken = ''
  let server = Config.apiServer
  const isLoggedIn = computed(() => JWT.value !== '')
  const info = computed(() => { return {
    token: JWT.value,
    refreshToken: RefreshToken,
  }})

  async function _restore() {
    let restoreCookie = Cookies.get(REFRESH_TOKEN)
    if (restoreCookie) {
      RefreshToken = restoreCookie
      await refreshToken()
    }
  }

  async function login( user: IUserLogin) : Promise<IApiResult> {
    let result = await post('auth', {email: user.email, password: user.pasword})
    if (result.isError) {
      JWT.value = ''
      RefreshToken = ''
      User.loggedOff()
      Cookies.remove(REFRESH_TOKEN)
      return result;
    } else {
      JWT.value = result.body.token
      RefreshToken = result.body.refreshToken
      Cookies.set(REFRESH_TOKEN, RefreshToken)
      User.loggedIn(result.body)
      return result
    }
  }
  async function logoff() {
    JWT.value = ''
    RefreshToken = ''
    User.loggedOff()
  }

  async function refreshToken(): Promise<IApiResult> {
    if (RefreshToken === '') {
      return {
        isError: true,
        status: 601,
        message: 'no refresh token'
      } as IApiResult
    }
    let result = await post('auth/refresh', {token: RefreshToken} , {isRefreshToken: true})
    if (result.isError) {
      Cookies.remove(REFRESH_TOKEN)
      JWT.value = ''
      return result;
    } else {
      JWT.value = result.body.token
      User.loggedIn(result.body)
      return result
    }
  }

  async function _parseResult(result: any, options:IFetchOptions) : Promise<IApiResult> {

    let msg
   // debugger
    switch (result.status) {
      case 400:
        let json = await result.json()
        if (json && json.errors && json.errors.length) {
          msg = json.errors.map(e => `${e.title} (${e.status})`).join(' \n')
        } else {
          msg = 'bad request'
        }
        return {
          isError: true,
          status: 404,
          message: msg
        } as IApiResult
      case 404:
        return {
          isError: true,
          status: 404,
          message: 'page not found'
        } as IApiResult
      case 403:
        return {
          isError: true,
          status: 403,
          message: 'access denied'
        } as IApiResult
      case 401:
        return {
          isError: true,
          status: 401,
          message: 'unauthorized'
        } as IApiResult
      case 200:
        let body;
        if (options.asBlob) {
          body = {
            blob: await result.blob(),
            filename: (result.headers.map['content-disposition'] || '').substring('attachment; filename='.length)
          };
        } else {
          body = (await result.json()).data
        }
        return {
          isError: false,
          status: 200,
          body,
          result
        } as IApiResult
      case 422:
         msg = ((await result.json()).errors || []).map(x => x.title).join('\n')
        // console.log(x)
        return {
          isError: true,
          status: 422,
          message: msg,
          result
        } as IApiResult
      case 501:
        return {
          isError: true,
          status: 500,
          message: 'no network'
        } as IApiResult
      case 500:
        msg = ''
        let stack = []
        try {
          let json = await result.json()
          if (json && json.errors && json.errors.length) {
            msg = json.errors.map(e => `${e.title} (${e.status})`).join(' \n')
            stack = json.errors[0].stack // we only trace the first one
          } else {
            msg = 'no errors defined'
          }
        } catch (e) {
          msg = `${result.statusText} (no json body)`
        }
        return {
          isError: true,
          status: 500,
          message: msg,
          stack
        } as IApiResult
      default:
        return {
          isError: true,
          status: 500,
          message: `unknown error: ${result.message || result.statusText}`
        } as IApiResult
    }
  }

  /**
   * handles the general connection problem, like the 401
   * @param server
   * @param requestOptions
   */
  async function _fetch(server: string, requestOptions: any) {
    try {
      // debugger
      let result = await fetch(server, requestOptions)

      if (result.status === 401 && RefreshToken !== '' && !requestOptions.isRefreshToken) { // expired, so use the refresh token
        let refr = await refreshToken()
        if (refr.isError) {
          return refr
        }
        // do it again
        result = await fetch(server, (requestOptions as any))
      }
      return result
    } catch (e: any) {
      // debugger
      return { status: 501, message: e.message, error: e} as IApiResult
    }
  }
  /**
   * post the data
   * @param url
   * @param body
   * @param options
   *
   * @returns Object: {isError, result, errorMessage, exceptionError}
   */
  async function post(url: string, body: any, options = {}) : Promise<IApiResult> {
    let requestOptions = _requestOptions('POST', body, options)
    try {
      let result = await _fetch(`${server}${url}`, (requestOptions as any))
      return await _parseResult(result, options)
    } catch (e: any) {
      return { isError: true, message: e.message, error: e} as IApiResult
    }
  }

  //https://stackoverflow.com/questions/8135132/how-to-encode-url-parameters
  const encodeGetParams = p =>
    Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&");

  async function get(url: string, query: any = {}, options = {}) : Promise<IApiResult> {

    let requestOptions = _requestOptions('GET', query, options)
    try {
      let queryString = encodeGetParams(query)
      let response = await _fetch(`${server}${url}?${queryString}`, (requestOptions as any))
      // debugger
      return  await _parseResult(response, options);
    } catch (e: any) {
      return { isError: true, message: e.message, error: e} as IApiResult
    }
  }


  const _requestOptions = (method: string, body: any, options: IFetchOptions = {}) => {
    let result = {
      method,
      headers: {
        'Content-Type': options.contentType || 'application/json',
      },
      isRefreshToken: options.hasOwnProperty('isRefreshToken')
    }
    if (method === 'POST') {
      result.body = JSON.stringify(body)
    }

    if (JWT.value.length) {
      (result.headers as any).Authorization = `BEARER ${JWT.value}`
    }
    return result
  }


  async function init() {
    // startup routines
    return await _restore()
  }

  return {
    isLoggedIn,
    login,
    logoff,
    refreshToken,
    info,
    post,
    get,
    init
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useApiStore, import.meta.hot))
