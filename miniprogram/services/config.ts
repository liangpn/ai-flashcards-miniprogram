// 全局配置常量
export const API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 获取 API Key
export function getApiKey(): string {
  const apiKey = wx.getStorageSync('deepseek_api_key');
  if (!apiKey) {
    throw new Error('请先配置 API 密钥');
  }
  return apiKey;
} 