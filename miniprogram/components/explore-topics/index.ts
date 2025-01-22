import { FlashCard, AIService } from '../../services/ai'
import { FlashCardService } from '../../services/flashcards'

Component({
  data: {
    keyword: '',
    topics: [] as string[],
    isLoading: false,
    error: '',
    showSettings: false,
    cardCount: 5,
    difficulty: 'medium',
    difficulties: [
      { value: 'easy', label: '简单' },
      { value: 'medium', label: '中等' },
      { value: 'hard', label: '困难' }
    ],
    selectedTopic: '',
    flashcards: [] as FlashCard[]
  },

  methods: {
    async handleExplore() {
      if (!this.data.keyword.trim()) {
        this.setData({ error: '请输入关键词' });
        return;
      }

      this.setData({ 
        isLoading: true,
        error: ''
      });

      try {
        // 真实请求
        // const topics = await AIService.getTopics(this.data.keyword);
        
        // 使用模拟数据替代 AI 请求
        console.log('使用模拟主题数据...');
        const topics = ['AI', '编程', '前端', '后端', '数据库'];
        
        this.setData({ topics });
      } catch (error) {
        console.error('探索主题失败:', error);
        this.setData({
          error: error instanceof Error ? error.message : '探索主题失败'
        });
      } finally {
        this.setData({ isLoading: false });
      }
    },

    handleInput(e: WechatMiniprogram.Input) {
      this.setData({
        keyword: e.detail.value,
        error: ''
      });
    },

    handleClear() {
      this.setData({
        keyword: '',
        topics: [],
        error: ''
      });
    },

    handleTopicSelect(e: WechatMiniprogram.TouchEvent) {
      const { topic } = e.currentTarget.dataset;
      this.setData({
        showSettings: true,
        selectedTopic: topic
      });
    },

    handleCardCountChange(e: WechatMiniprogram.SliderChange) {
      this.setData({
        cardCount: e.detail.value
      });
    },

    handleDifficultySelect(e: WechatMiniprogram.TouchEvent) {
      const { value } = e.currentTarget.dataset;
      this.setData({ difficulty: value });
    },

    handleSettingsCancel() {
      this.setData({
        showSettings: false
      });
    },

    handleClose() {
      console.log('=== 处理关闭事件 ===');
      this.setData({
        flashcards: [],
        keyword: '',    // 清空关键词
        topics: [],     // 清空主题列表
        error: '',      // 清空错误信息
        showSettings: false  // 关闭设置弹窗
      });
    },

    async handleSettingsConfirm() {
      const { selectedTopic, cardCount, difficulty } = this.data;
      console.log('=== 开始生成主题卡片 ===');
      console.log('生成参数:', { selectedTopic, cardCount, difficulty });
      
      try {
        

        // 调用 AI 服务生成卡片
        const apiKey = wx.getStorageSync('deepseek_api_key');
        if (!apiKey) {
          throw new Error('请先配置 API 密钥');
        }

        // 显示加载状态
        wx.showLoading({
          title: '生成中...',
          mask: true
        });

        // 真实请求
        // const mockCards = await AIService.generateFlashcards(
        //   2, // 2是探索主题页面传递的请求
        //   selectedTopic,
        //   cardCount,
        //   apiKey,
        //   difficulty
        // );

        // 使用模拟数据替代 AI 请求
        console.log('使用模拟数据...');
        const mockCards = FlashCardService.getMockCards();
        console.log('获取模拟数据成功:', mockCards);

        console.log('当前组件数据状态:', this.data);
        // 为每张卡片添加topic信息
        const flashcards = mockCards.map(card => ({
          ...card,
          topic: selectedTopic  // 使用选中的主题作为topic
        }));

        // 先关闭设置弹窗，更新状态
        this.setData({
          showSettings: false,
          flashcards
        }, () => {
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
        wx.showToast({
          title: error instanceof Error ? error.message : '生成失败',
          icon: 'none'
        });
      } finally {
        wx.hideLoading();
        console.log('生成流程结束');
      }
    }
  }
}); 