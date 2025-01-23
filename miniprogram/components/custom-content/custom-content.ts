import { FlashCard, AIService } from '../../services/ai'
import { FlashCardService } from '../../services/flashcards'

Component({
  data: {
    content: '',
    cardCount: 5,
    isLoading: false,
    error: '',
    apiKey: '',  // 从本地存储获取
    difficulty: 'medium', // 默认中等难度
    difficulties: [
      { value: 'easy', label: '简单' },
      { value: 'medium', label: '中等' },
      { value: 'hard', label: '困难' }
    ],
    flashcards: [] as FlashCard[]
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

    handleDifficultyChange(e: WechatMiniprogram.TouchEvent) {
      const { value } = e.currentTarget.dataset;
      console.log('难度选择:', value);
      if (value) {  // 添加值的检查
        this.setData({ 
          difficulty: value,
          error: ''  // 清除可能的错误信息
        });
      }
    },

    handleClose() {
      console.log('=== 处理关闭事件 ===');
      this.setData({
        flashcards: [],
        content: '',  // 清空输入内容
        error: ''     // 清空错误信息
      });
    },

    async handleSubmit() {
      console.log('=== 开始生成卡片 ===');
      console.log('提交参数:', {
        contentLength: this.data.content.length,
        cardCount: this.data.cardCount,
        hasApiKey: !!this.data.apiKey,
        difficulty: this.data.difficulty
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
        // const flashcards = await AIService.generateFlashcards(1, this.data.content, this.data.cardCount, this.data.apiKey, this.data.difficulty)
        
        // 使用模拟数据替代 AI 请求
        console.log('使用模拟数据...');
        const flashcards = FlashCardService.getMockCards();
        console.log('获取模拟数据成功:', flashcards);

        console.log('当前组件数据状态:', this.data);
        
        // 更新状态，显示卡片展示组件
        this.setData({ flashcards }, () => {
          console.log('更新flashcards后的状态:', this.data.flashcards);
          
          // 获取card-display组件实例并调用其方法
          const cardDisplay = this.selectComponent('#cardDisplay');
          console.log('获取到的cardDisplay组件:', cardDisplay);
          
          if (cardDisplay) {
            console.log('调用cardDisplay.handleCardsGenerated方法');
            cardDisplay.handleCardsGenerated({ detail: { flashcards } });
          } else {
            console.error('未找到cardDisplay组件实例');
          }
        });
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