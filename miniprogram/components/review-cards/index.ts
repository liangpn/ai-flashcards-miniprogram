import { FlashCard } from '../../services/ai'

Component({
  data: {
    reviewCards: [] as FlashCard[],
    currentIndex: 0,
    showAnswer: false,
    isLoading: false,
    error: '',
    progress: {
      total: 0,
      reviewed: 0,
      remembered: 0
    }
  },

  lifetimes: {
    attached() {
      this.loadReviewCards();
    }
  },

  methods: {
    async loadReviewCards() {
      console.log('=== 加载复习卡片 ===');
      this.setData({ isLoading: true });

      try {
        // 从本地存储获取已标记的卡片
        const markedCards = wx.getStorageSync('markedCards') || [];
        console.log('获取到标记卡片:', markedCards.length);

        // 随机打乱顺序
        const shuffled = [...markedCards].sort(() => Math.random() - 0.5);
        console.log('打乱顺序后准备复习');

        this.setData({
          reviewCards: shuffled,
          currentIndex: 0,
          showAnswer: false,
          progress: {
            total: shuffled.length,
            reviewed: 0,
            remembered: 0
          },
          isLoading: false
        });
      } catch (error) {
        console.error('加载复习卡片失败:', error);
        this.setData({
          error: '加载失败',
          isLoading: false
        });
      }
    },

    toggleAnswer() {
      console.log('切换答案显示状态');
      this.setData({
        showAnswer: !this.data.showAnswer
      });
    },

    handleRemembered(e: WechatMiniprogram.TouchEvent) {
      console.log('=== 标记记忆状态 ===');
      const { remembered } = e.currentTarget.dataset;
      console.log('是否记住:', remembered);
      
      const { currentIndex, progress, reviewCards } = this.data;
      const newProgress = {
        ...progress,
        reviewed: progress.reviewed + 1,
        remembered: remembered ? progress.remembered + 1 : progress.remembered
      };

      console.log('更新进度:', {
        原进度: progress,
        新进度: newProgress,
        是否记住: remembered
      });

      // 移动到下一张卡片
      if (currentIndex < reviewCards.length - 1) {
        this.setData({
          currentIndex: currentIndex + 1,
          showAnswer: false,
          progress: newProgress
        });
      } else {
        // 复习完成
        wx.showModal({
          title: '复习完成',
          content: `共复习 ${newProgress.reviewed} 张卡片，记住了 ${newProgress.remembered} 张`,
          showCancel: false,
          success: () => {
            // 重新开始复习
            this.loadReviewCards();
          }
        });
      }
    }
  }
}); 