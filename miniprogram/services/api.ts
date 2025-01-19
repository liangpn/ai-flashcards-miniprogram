// 基础配置
const BASE_URL = 'https://your-api-domain.com/api'  // TODO: 替换为实际的API域名
const DEFAULT_TIMEOUT = 10000 // 10秒超时

// 请求方法类型
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

// 请求配置接口
interface RequestConfig {
  url: string
  method?: Method
  data?: any
  timeout?: number
}

// 统一的错误处理
const handleError = (error: any) => {
  console.error('请求错误:', error)
  wx.showToast({
    title: '网络请求失败',
    icon: 'error'
  })
  return Promise.reject(error)
}

// 请求拦截器
const requestInterceptor = (config: RequestConfig) => {
  // TODO: 添加token等认证信息
  return config
}

// 响应拦截器
const responseInterceptor = (response: any) => {
  // TODO: 处理响应数据，例如统一的错误码处理
  return response.data
}

// 统一的请求方法
export const request = async <T>(config: RequestConfig): Promise<T> => {
  try {
    const finalConfig = requestInterceptor(config)
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}${finalConfig.url}`,
        method: finalConfig.method || 'GET',
        data: finalConfig.data,
        timeout: finalConfig.timeout || DEFAULT_TIMEOUT,
        success: resolve,
        fail: reject
      })
    })

    return responseInterceptor(response) as T
  } catch (error) {
    return handleError(error)
  }
}

// 导出便捷方法
export const get = <T>(url: string, data?: any) => 
  request<T>({ url, method: 'GET', data })

export const post = <T>(url: string, data?: any) => 
  request<T>({ url, method: 'POST', data })

export const put = <T>(url: string, data?: any) => 
  request<T>({ url, method: 'PUT', data })

export const del = <T>(url: string, data?: any) => 
  request<T>({ url, method: 'DELETE', data }) 