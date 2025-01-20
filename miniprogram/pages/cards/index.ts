import { FlashCard } from '../../services/ai'

Component({
  data: {
    currentTab: 'custom',
    flashcards: [] as FlashCard[],    // 当前卡片列表
    currentCardIndex: 0,              // 当前卡片索引
    showAnswer: false,                // 是否显示答案
    markedCards: [] as FlashCard[],   // 改为存储完整卡片
    isMarked: false  // 新增计算属性的结果
  },

  observers: {
    // 监听依赖的数据变化，自动更新 isMarked
    'currentCardIndex, flashcards, markedCards': function() {
      console.log('=== 监听到数据变化，重新计算标记状态 ===');
      const isMarked = this.isCurrentCardMarked();
      this.setData({ isMarked });
    }
  },

  lifetimes: {
    attached() {
      console.log('=== Cards Page Attached ===');
      this.resetState();
      // 从本地存储加载标记的卡片
      wx.getStorage({
        key: 'markedCards',
        success: (res) => {
          console.log('加载已标记卡片:', res.data);
          this.setData({
            markedCards: res.data || []
          }, () => {
            console.log('标记状态已更新:', this.data.markedCards);
          });
        },
        fail: (error) => {
          console.log('加载已标记卡片失败:', error);
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
      const { currentCardIndex, flashcards, markedCards } = this.data;
      if (!flashcards.length) return false;
      
      const currentQuestion = flashcards[currentCardIndex].question;
      return markedCards.some((card: FlashCard) => 
        card.question === currentQuestion
      );
    },

    // 处理标记/取消标记
    handleMarkCard() {
      console.log('=== 处理标记/取消标记 ===');
      const { currentCardIndex, flashcards } = this.data;
      const currentCard = flashcards[currentCardIndex];
      
      // 获取已保存的卡片
      const markedCards = wx.getStorageSync('markedCards') || [];
      
      // 检查是否已标记
      const isMarked = markedCards.some((card: FlashCard) => 
        card.question === currentCard.question
      );
      
      if (isMarked) {
        // 取消标记：移除卡片
        const newMarkedCards = markedCards.filter((card: FlashCard) => 
          card.question !== currentCard.question
        );
        wx.setStorageSync('markedCards', newMarkedCards);
        console.log('取消标记卡片:', currentCard.question);
      } else {
        // 添加标记：保存完整卡片
        markedCards.push({
          question: currentCard.question,
          answer: currentCard.answer,
          createdAt: new Date().toISOString()
        });
        wx.setStorageSync('markedCards', markedCards);
        console.log('标记新卡片:', currentCard.question);
      }

      // 更新UI状态
      this.setData({ 
        isMarked: !isMarked
      });
    },

    // 添加标签切换方法
    switchTab(e: WechatMiniprogram.TouchEvent) {
      const { tab } = e.currentTarget.dataset;
      console.log('=== 切换标签 ===');
      console.log('目标标签:', tab);
      
      if (this.data.currentTab === tab) {
        console.log('已经在当前标签，不需要切换');
        return;
      }

      this.setData({ 
        currentTab: tab,
        // 切换标签时重置卡片状态
        flashcards: [],
        currentCardIndex: 0,
        showAnswer: false
      }, () => {
        console.log('标签切换完成:', this.data.currentTab);
      });
    },

  }
}) 