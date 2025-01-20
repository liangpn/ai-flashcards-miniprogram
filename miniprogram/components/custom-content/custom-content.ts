import { AIService } from '../../services/ai'
import { FlashCardService } from '../../services/flashcards'

Component({
  data: {
    content: '',
    cardCount: 5,
    isLoading: false,
    error: '',
    apiKey: ''  // 从本地存储获取
  },

  lifetimes: {
    attached() {
      console.log('=== Custom Content 组件加载 ===');
      // 组件加载时从本地存储获取 API Key
      const apiKey = wx.getStorageSync('deepseek_api_key')
      console.log('加载 API Key:', apiKey ? '成功' : '未找到');
      this.setData({ apiKey })
    }
  },

  methods: {
    handleContentInput(e: WechatMiniprogram.Input) {
      console.log('内容输入更新:', e.detail.value.length + '字');
      this.setData({
        content: e.detail.value
      })
    },

    handleCardCountChange(e: WechatMiniprogram.SliderChange) {
      console.log('卡片数量更新:', e.detail.value);
      this.setData({
        cardCount: e.detail.value
      })
    },

    async handleSubmit() {
      console.log('=== 开始生成卡片 ===');
      console.log('提交参数:', {
        contentLength: this.data.content.length,
        cardCount: this.data.cardCount,
        hasApiKey: !!this.data.apiKey
      });

      if (!this.data.content.trim()) {
        console.log('验证失败: 内容为空');
        this.setData({
          error: '请输入学习内容'
        });
        return;
      }

      this.setData({
        isLoading: true,
        error: ''
      });

      try {
        // 真实请求
        // const flashcards = await AIService.generateFlashcards(this.data.content, this.data.cardCount, this.data.apiKey)
        
        // 使用模拟数据替代 AI 请求
        console.log('使用模拟数据...');
        const flashcards = FlashCardService.getMockCards();
        
        console.log('获取模拟数据成功:', flashcards);
        this.triggerEvent('cardsGenerated', { flashcards });
      } catch (error) {
        console.error('生成失败:', error);
        this.setData({
          error: error instanceof Error ? error.message : '生成卡片失败'
        });
      } finally {
        this.setData({
          isLoading: false
        });
        console.log('生成流程结束');
      }
    }
  }
}) 