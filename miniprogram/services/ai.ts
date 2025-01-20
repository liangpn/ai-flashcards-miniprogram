// 基础卡片结构
export interface FlashCard {
  question: string;  // 问题文本
  answer: string;    // 答案文本
}

export class AIService {
  private static readonly API_URL = 'https://api.deepseek.com/v1/chat/completions';

  // 生成闪卡的方法
  static async generateFlashcards(
    content: string, 
    cardCount: number,
    apiKey: string
  ): Promise<FlashCard[]> {
    console.log('=== 开始生成闪卡 ===');
    console.log('生成参数:', {
      content: content.slice(0, 100) + '...', // 只显示部分内容
      cardCount,
      hasApiKey: !!apiKey
    });

    const systemPrompt = `你是一个专业的教育助手，擅长创建高质量的学习卡片。
请注意以下要求：
1. 无论输入内容是什么语言，始终用中文创建问答卡片
2. 如果输入内容是英文或其他语言，在回答中可以保留原文，但解释必须用中文
3. 确保问题简短清晰，答案准确完整
4. 严格按照JSON格式返回，不要包含任何其他文字`;

    const prompt = `请将以下内容分解成${cardCount}张闪卡：

内容：${content}

使用 Markdown 格式，并严格按照以下JSON格式返回，确保是有效的JSON：
[
  {
    "question": "Markdown 格式的问题",
    "answer": "Markdown 格式的答案"
  }
]`;

    try {
      const response = await new Promise((resolve, reject) => {
        console.log('发起 API 请求...');
        wx.request({
          url: AIService.API_URL,
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
      const cards = JSON.parse(data.choices[0].message.content.trim());
      console.log('生成闪卡成功:', cards);
      return cards;
    } catch (error) {
      console.error('生成闪卡失败:', error);
      throw error;
    }
  }
} 