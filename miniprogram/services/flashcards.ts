import { get, post } from './api'
import { FlashCard } from './ai'

// 生成卡片的参数接口
export interface GenerateCardParams {
  topic: string;      // 主题
  count?: number;     // 卡片数量
  difficulty?: 'easy' | 'medium' | 'hard';  // 难度
}

// 卡片服务类
export class FlashCardService {
  // 获取卡片列表
  static async getCards(topic?: string): Promise<FlashCard[]> {
    const params = topic ? { topic } : {}
    return get<FlashCard[]>('/flashcards', params)
  }

  // 生成新卡片
  static async generateCards(params: GenerateCardParams): Promise<FlashCard[]> {
    return post<FlashCard[]>('/flashcards/generate', params)
  }

  // 获取已标记的卡片
  static async getMarkedCards(): Promise<FlashCard[]> {
    return get<FlashCard[]>('/flashcards/marked')
  }

  // 标记/取消标记卡片
  static async toggleMarkCard(cardId: string, isMarked: boolean): Promise<FlashCard> {
    return post<FlashCard>(`/flashcards/${cardId}/mark`, { isMarked })
  }

  // 获取推荐主题
  static async getRecommendedTopics(): Promise<string[]> {
    return get<string[]>('/flashcards/topics')
  }

  // 模拟数据方法 (开发阶段使用)
  static getMockCards(): FlashCard[] {
    return [
      {
        question: '什么是 TypeScript?',
        answer: 'TypeScript 是 JavaScript 的超集，添加了可选的静态类型和基于类的面向对象编程。',
        topic: 'TypeScript'
      },
      {
        question: '解释 React 中的虚拟 DOM',
        answer: '虚拟 DOM 是 React 中的一个概念，它是真实 DOM 的一个轻量级副本。React 使用虚拟 DOM 来优化渲染性能，通过比较虚拟 DOM 的差异来最小化实际 DOM 操作。',
        topic: 'React'
      },
      {
        question: '什么是微信小程序的生命周期？',
        answer: '微信小程序的生命周期包括 onLoad（页面加载）、onShow（页面显示）、onReady（页面初次渲染完成）、onHide（页面隐藏）和 onUnload（页面卸载）等重要阶段。',
        topic: '微信小程序'
      }
    ];
  }
} 