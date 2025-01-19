import { FlashCard, FlashCardService } from '../../services/flashcards'

Component({
  data: {
    currentTab: 'custom',
    flashcards: [] as FlashCard[],
    currentCardIndex: 0,
    showAnswer: false
  },

  lifetimes: {
    attached() {
      this.resetState();
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
    resetState() {
      this.setData({
        flashcards: [],
        currentCardIndex: 0,
        showAnswer: false,
        currentTab: 'custom'
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

    handleCardsGenerated(e: WechatMiniprogram.CustomEvent) {
      const { flashcards } = e.detail;
      this.setData({
        flashcards,
        currentCardIndex: 0,
        showAnswer: false
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
    }
  }
}) 