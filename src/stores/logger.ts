import { acceptHMRUpdate, defineStore } from 'pinia'

export interface ILoggerStore {
  log(msg: string, data?: any): void
  warn(msg: string, data?: any): void
  error(msg: string, data?: any): void
}

export const useLoggerStore: ILoggerStore = defineStore('logger', () => {
  const log = (msg: string, data?: any) => {
    if (data) {
      console.log(msg, data)
    } else {
      console.log(msg)
    }
  }

  const warn = (msg: string, data?: any) => {
    if (data) {
      console.warn(msg, data)
    } else {
      console.warn(msg)
    }
  }

  const error = (msg: string, data?: any) => {
    if (data) {
      console.error(msg, data)
    } else {
      console.error(msg)
    }
  }

  return {
    log,
    warn,
    error
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useConfigStore, import.meta.hot))
