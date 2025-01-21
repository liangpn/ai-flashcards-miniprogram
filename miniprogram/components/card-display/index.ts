interface IFlashcard {
  question: string;
  answer: string;
  isMarked?: boolean;
  createdAt?: string;
}

Component({
  properties: {
    flashcards: {
      type: Array,
      value: [] as IFlashcard[]
    },
    currentIndex: {
      type: Number,
      value: 0
    }
  },

  data: {
    showAnswer: false,
    isMarked: false,
    markedCards: [] as IFlashcard[],
    flashcards: [] as IFlashcard[],
    currentIndex: 0
  },

  lifetimes: {
    attached() {
      // 从本地存储加载标记的卡片
      const markedCards = wx.getStorageSync('markedCards') || [];
      this.setData({ markedCards }, () => {
        // 更新当前卡片的标记状态
        this.updateCurrentCardMarkStatus();
      });
    }
  },

  observers: {
    'currentIndex, flashcards': function(currentIndex: number, flashcards: IFlashcard[]) {
      if (flashcards && flashcards[currentIndex]) {
        this.setData({
          showAnswer: false
        });
        this.updateCurrentCardMarkStatus();
      }
    }
  },

  methods: {
    handleClose() {
      console.log('=== 关闭卡片展示 ===');
      // 触发关闭事件，让父组件处理
      this.triggerEvent('close');
      // 重置组件状态
      this.setData({
        flashcards: [],
        currentIndex: 0,
        showAnswer: false,
        isMarked: false
      });
    },

    handleCardsGenerated(e: WechatMiniprogram.CustomEvent) {
      console.log('=== card-display: 处理生成的卡片 ===');
      console.log('接收到的事件数据:', e.detail);
      console.log('当前组件数据状态:', this.data);
      
      this.setData({
        flashcards: e.detail.flashcards,
        currentIndex: 0,
        showAnswer: false
      }, () => {
        console.log('更新后的组件状态:', this.data);
      });
    },

    updateCurrentCardMarkStatus() {
      console.log('=== 更新卡片标记状态 ===');
      const { currentIndex, flashcards, markedCards } = this.data;
      if (!flashcards.length) {
        console.log('没有卡片数据，跳过更新');
        return;
      }

      const currentCard = flashcards[currentIndex];
      const isMarked = markedCards.some(card => 
        card.question === currentCard.question
      );
      
      console.log('当前卡片标记状态:', { currentIndex, isMarked });
      this.setData({ isMarked });
    },

    handlePrevCard() {
      if (this.data.currentIndex > 0) {
        this.setData({
          currentIndex: this.data.currentIndex - 1,
          showAnswer: false
        });
      }
    },

    handleNextCard() {
      if (this.data.currentIndex < this.data.flashcards.length - 1) {
        this.setData({
          currentIndex: this.data.currentIndex + 1,
          showAnswer: false
        });
      }
    },

    handleToggleAnswer() {
      this.setData({
        showAnswer: !this.data.showAnswer
      });
    },

    handleMarkCard() {
      const { currentIndex, flashcards, markedCards } = this.data;
      const currentCard = flashcards[currentIndex];
      
      // 检查是否已标记
      const isMarked = markedCards.some(card => 
        card.question === currentCard.question
      );
      
      let newMarkedCards;
      if (isMarked) {
        // 取消标记：移除卡片
        newMarkedCards = markedCards.filter(card => 
          card.question !== currentCard.question
        );
        console.log('取消标记卡片:', currentCard.question);
      } else {
        // 添加标记：保存完整卡片
        newMarkedCards = [...markedCards, {
          question: currentCard.question,
          answer: currentCard.answer,
          createdAt: new Date().toISOString()
        }];
        console.log('标记新卡片:', currentCard.question);
      }

      // 更新本地存储和状态
      wx.setStorageSync('markedCards', newMarkedCards);
      this.setData({ 
        markedCards: newMarkedCards,
        isMarked: !isMarked
      });

      // 触发事件通知父组件
      this.triggerEvent('markCard', { 
        index: currentIndex,
        isMarked: !isMarked
      });
    }
  }
}); 