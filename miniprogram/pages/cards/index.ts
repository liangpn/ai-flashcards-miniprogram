import { FlashCard } from '../../services/ai'

Component({
  data: {
    currentTab: 'custom',
    flashcards: [] as FlashCard[],    // 当前卡片列表
    currentCardIndex: 0,              // 当前卡片索引
    showAnswer: false,                // 是否显示答案
    markedQuestions: new Set<string>(),
    isMarked: false  // 新增计算属性的结果
  },

  observers: {
    // 监听依赖的数据变化，自动更新 isMarked
    'currentCardIndex, flashcards, markedQuestions': function() {
      console.log('=== 监听到数据变化，重新计算标记状态 ===');
      const isMarked = this.isCurrentCardMarked();
      this.setData({ isMarked });
    }
  },

  lifetimes: {
    attached() {
      console.log('=== Cards Page Attached ===');
      this.resetState();
      // 从本地存储加载标记状态
      wx.getStorage({
        key: 'markedQuestions',
        success: (res) => {
          console.log('加载本地标记状态:', res.data);
          this.setData({
            markedQuestions: new Set(res.data || [])
          }, () => {
            console.log('标记状态已更新:', this.data.markedQuestions);
          });
        },
        fail: (error) => {
          console.log('加载本地标记状态失败:', error);
        }
      });
    }
  },

  pageLifetimes: {
    // 页面显示时也重置数据
    show() {
      this.setData({
        flashcards: [],
        currentCardIndex: 0,
        showAnswer: false
      });
    }
  },

  methods: {
    // 重置状态
    resetState() {
      console.log('=== 重置状态 ===');
      console.log('重置前状态:', this.data);
      this.setData({
        flashcards: [],
        currentCardIndex: 0,
        showAnswer: false,
        currentTab: 'custom'
      }, () => {
        console.log('重置后状态:', this.data);
      });
    },

    handleBack() {
      console.log('cards page: handleBack called');
      const pages = getCurrentPages();
      console.log('current pages stack:', pages.length);
      
      if (pages.length > 1) {
        wx.navigateBack({
          delta: 1,
          success: () => {
            console.log('cards page: navigation success, resetting state');
            this.resetState();
          },
          fail: (error) => {
            console.error('cards page: navigation failed', error);
          }
        });
      }
    },

    // 处理生成的卡片
    handleCardsGenerated(e: WechatMiniprogram.CustomEvent) {
      console.log('=== 处理生成的卡片 ===');
      console.log('接收到的卡片数据:', e.detail.flashcards);
      this.setData({
        flashcards: e.detail.flashcards,
        currentCardIndex: 0,
        showAnswer: false
      }, () => {
        console.log('卡片数据已更新:', this.data);
      });
    },

    // 切换答案显示状态
    toggleAnswer() {
      console.log('=== 切换答案显示状态 ===');
      this.setData({
        showAnswer: !this.data.showAnswer
      }, () => {
        console.log('答案显示状态:', this.data.showAnswer);
      });
    },

    handlePrevCard() {
      if (this.data.currentCardIndex > 0) {
        this.setData({
          currentCardIndex: this.data.currentCardIndex - 1,
          showAnswer: false
        });
      }
    },

    handleNextCard() {
      if (this.data.currentCardIndex < this.data.flashcards.length - 1) {
        this.setData({
          currentCardIndex: this.data.currentCardIndex + 1,
          showAnswer: false
        });
      }
    },

    handleApiKeyChange(e: WechatMiniprogram.CustomEvent) {
      const { apiKey } = e.detail;
      // 更新自定义内容组件的 API Key
      const customContent = this.selectComponent('.custom-content');
      if (customContent) {
        customContent.setData({ apiKey });
      }
    },

    isCurrentCardMarked() {
      console.log('=== 检查当前卡片标记状态 ===');
      const { currentCardIndex, flashcards, markedQuestions } = this.data;
      console.log('当前卡片索引:', currentCardIndex);
      console.log('卡片列表:', flashcards);
      console.log('已标记问题:', markedQuestions);
      if (!flashcards.length) return false;
      const currentQuestion = flashcards[currentCardIndex].question;
      const isMarked = markedQuestions.has(currentQuestion);
      console.log('检查当前卡片标记状态:', {
        currentQuestion,
        isMarked,
        markedQuestions: Array.from(markedQuestions)
      });
      return isMarked;
    },

    // 处理标记/取消标记
    handleMarkCard() {
      console.log('=== 处理标记/取消标记 ===');
      const { currentCardIndex, flashcards, markedQuestions } = this.data;
      const currentQuestion = flashcards[currentCardIndex].question;
      const newMarkedQuestions = new Set(Array.from(markedQuestions));

      if (newMarkedQuestions.has(currentQuestion)) {
        newMarkedQuestions.delete(currentQuestion);
      } else {
        newMarkedQuestions.add(currentQuestion);
      }

      // 更新状态
      this.setData({ 
        markedQuestions: newMarkedQuestions,
        // isMarked 会通过 observers 自动更新
      });

      // 保存到本地存储
      wx.setStorage({
        key: 'markedQuestions',
        data: Array.from(newMarkedQuestions)
      });
    },

  }
}) 