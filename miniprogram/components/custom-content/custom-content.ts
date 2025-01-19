import { AIService } from '../../services/ai'

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
      // 组件加载时从本地存储获取 API Key
      const apiKey = wx.getStorageSync('deepseek_api_key')
      this.setData({ apiKey })
    }
  },

  methods: {
    handleContentInput(e: WechatMiniprogram.Input) {
      this.setData({
        content: e.detail.value
      })
    },

    handleCardCountChange(e: WechatMiniprogram.SliderChange) {
      this.setData({
        cardCount: e.detail.value
      })
    },

    async handleSubmit() {
      if (!this.data.content.trim()) {
        this.setData({
          error: '请输入学习内容'
        })
        return
      }

      if (!this.data.apiKey) {
        this.setData({
          error: '请先在设置中配置 API 密钥'
        })
        return
      }

      this.setData({
        isLoading: true,
        error: ''
      })

      try {
        const flashcards = await AIService.generateFlashcards(
          this.data.content,
          this.data.cardCount,
          this.data.apiKey
        )

        // 触发事件，将生成的卡片传递给父组件
        this.triggerEvent('cardsGenerated', { flashcards })
      } catch (error) {
        this.setData({
          error: error instanceof Error ? error.message : '生成卡片失败'
        })
      } finally {
        this.setData({
          isLoading: false
        })
      }
    }
  }
}) 