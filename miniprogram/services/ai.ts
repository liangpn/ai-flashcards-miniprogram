import { API_URL, getApiKey, getTopicSystemPrompt, getCustomCardSystemPrompt, getCustomCardUserPrompt } from './config';

// 基础卡片结构
export interface FlashCard {
  question: string;  // 问题文本
  answer: string;    // 答案文本
  topic: string;    // 主题
}

export class AIService {
  // 生成闪卡的方法
  static async generateFlashcards(
    type: number,
    content: string, 
    cardCount: number,
    apiKey: string,
    difficulty: string = '中等'  // 添加难度参数
  ): Promise<FlashCard[]> {
    console.log('=== 开始生成闪卡 ===');
    console.log('生成参数:', {
      content: content.slice(0, 100) + '...', // 只显示部分内容
      cardCount,
      hasApiKey: !!apiKey
    });

    const systemPrompt = getCustomCardSystemPrompt(difficulty);

    const prompt = getCustomCardUserPrompt(type,cardCount, content);

    try {
      const response = await new Promise((resolve, reject) => {
        console.log('发起 API 请求...');
        wx.request({
          url: API_URL,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          data: {
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
          },
          success: (res) => {
            console.log('API 请求成功');
            resolve(res);
          },
          fail: (error) => {
            console.error('API 请求失败:', error);
            reject(error);
          }
        });
      }) as WechatMiniprogram.RequestSuccessCallbackResult;

      const data = response.data as any;
      console.log('API 返回数据:', data);
      console.log('API 返回数据:', data.choices[0].message.content);
      const cards = JSON.parse(data.choices[0].message.content.trim());
      console.log('生成闪卡成功:', cards);
      return cards;
    } catch (error) {
      console.error('生成闪卡失败:', error);
      throw error;
    }
  }

  static async getTopics(keyword: string): Promise<string[]> {
    const apiKey = getApiKey();
  
    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: API_URL,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          data: {
            model: 'deepseek-chat',
            messages: [
              { 
                role: 'system', 
                content: getTopicSystemPrompt(keyword)
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          },
          success: (res) => resolve(res),
          fail: (error) => reject(error)
        });
      }) as WechatMiniprogram.RequestSuccessCallbackResult;
  
      const data = response.data as any;
      return data.choices[0].message.content.trim().split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
    } catch (error) {
      console.error('获取主题失败:', error);
      throw error;
    }
  } 


}

