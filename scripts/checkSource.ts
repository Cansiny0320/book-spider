// @ts-nocheck
import { sources } from '../src/config'
import axios from 'axios'
import { logger } from '../src/utils'
axios.interceptors.request.use(
  function (config) {
    config.metadata = { startTime: new Date() }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  function (response) {
    response.config.metadata.endTime = new Date()
    response.duration =
      response.config.metadata.endTime - response.config.metadata.startTime
    return response
  },
  function (error) {
    return Promise.reject(error)
  }
)

const requests = []

sources.forEach(e =>
  requests.push(
    axios
      .get(e.Url)
      .then(res => logger.success(`${e.Url} 访问正常，延迟 ${res.duration}ms`))
      .catch(() => logger.fatal(`${e.Url} 访问失败`))
  )
)
