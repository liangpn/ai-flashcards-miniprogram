import { FlashCard } from '../../services/ai'

interface TopicItem {
  name: string;
  selected: boolean;
}

Component({
  data: {
    availableTopics: [] as TopicItem[],    // 所有可选的 topic
    selectedTopics: [] as string[],         // 选中的主题列表
    isDropdownOpen: false,              // 下拉列表是否展开
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
      this.loadAvailableTopics();
    }
  },

  methods: {
    async loadAvailableTopics() {
      console.log('=== 加载可选主题 ===');
      this.setData({ isLoading: true });

      try {
        // 从本地存储获取已标记的卡片
        const markedCards = wx.getStorageSync('markedCards') || [] as FlashCard[];
        console.log('获取到标记卡片:', markedCards.length);

        // 提取所有不重复的 topic
        const uniqueTopics = Array.from(
          new Set(
            markedCards.map((card: FlashCard) => card.topic || '未分类')
          )
        ) as string[];
        const topics: TopicItem[] = uniqueTopics.map(name => ({
          name,
          selected: false
        }));
        console.log('可选主题:', topics);

        this.setData({
          availableTopics: topics,
          isLoading: false
        });
      } catch (error) {
        console.error('加载主题失败:', error);
        this.setData({
          error: '加载失败',
          isLoading: false
        });
      }
    },

    toggleDropdown() {
      console.log('=== 切换下拉列表状态 ===');
      this.setData({
        isDropdownOpen: !this.data.isDropdownOpen
      });
    },

    handleTopicClick(e: WechatMiniprogram.TouchEvent) {
      console.log('=== 选择主题 ===');
      const topic = e.currentTarget.dataset.topic as string;
      console.log('点击的主题:', topic);
      
      const availableTopics = this.data.availableTopics.map(item => {
        if (item.name === topic) {
          return { ...item, selected: !item.selected };
        }
        return item;
      });
      
      // 计算选中的主题数量
      const selectedTopics = availableTopics.filter(item => item.selected).map(item => item.name);
      console.log('选中的主题数量:', selectedTopics.length);
      
      this.setData({ 
        availableTopics,
        selectedTopics,  // 更新选中的主题列表
        isDropdownOpen: true  // 保持下拉列表展开，方便继续选择
      });
    },

    async startReview() {
      console.log('=== 开始复习 ===');
      const selectedTopics = this.data.availableTopics
        .filter(item => item.selected)
        .map(item => item.name);

      if (!selectedTopics.length) {
        wx.showToast({
          title: '请选择要复习的主题',
          icon: 'none'
        });
        return;
      }

      this.setData({ isLoading: true });

      try {
        // 从本地存储获取已标记的卡片
        const markedCards = wx.getStorageSync('markedCards') || [] as FlashCard[];
        console.log('获取到标记卡片:', markedCards.length);

        // 根据选中的主题过滤卡片
        const filteredCards = markedCards.filter((card: FlashCard) => 
          selectedTopics.includes(card.topic || '未分类')
        );
        console.log('过滤后的卡片:', filteredCards.length);

        // 随机打乱顺序
        const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
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
        console.error('准备复习卡片失败:', error);
        this.setData({
          error: '加载失败',
          isLoading: false
        });
      }
    },

    resetReview() {
      console.log('=== 重置复习状态 ===');
      const availableTopics = this.data.availableTopics.map(item => ({
        ...item,
        selected: false
      }));

      this.setData({
        reviewCards: [],
        currentIndex: 0,
        showAnswer: false,
        availableTopics,
        selectedTopics: [],  // 重置选中的主题列表
        progress: {
          total: 0,
          reviewed: 0,
          remembered: 0
        }
      });
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
            // 重置复习状态
            this.resetReview();
          }
        });
      }
    }
  }
}); 