import { FlashCard } from '../../services/ai'

Component({
  data: {
    markedCards: [] as Array<FlashCard & { selected?: boolean }>,
    isLoading: false,
    error: '',
    selectedCount: 0,
    isAllSelected: false
  },

  lifetimes: {
    attached() {
      this.loadMarkedCards();
    }
  },

  methods: {
    async loadMarkedCards() {
      console.log('=== 加载已标记卡片 ===');
      this.setData({ isLoading: true });

      try {
        // 直接从本地存储获取已标记的卡片
        const markedCards = wx.getStorageSync('markedCards') || [];
        console.log('已标记的卡片:', markedCards);

        this.setData({
          markedCards,
          isLoading: false
        });
      } catch (error) {
        console.error('加载已标记卡片失败:', error);
        this.setData({
          error: '加载失败',
          isLoading: false
        });
      }
    },

    handleUnmarkCard(e: WechatMiniprogram.TouchEvent) {
      const { index } = e.currentTarget.dataset;
      const { markedCards } = this.data;
      
      // 添加确认提示
      wx.showModal({
        title: '取消标记',
        content: '确定要取消标记这张卡片吗？此操作不可恢复！',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 用户点击确定，执行取消标记
            const newMarkedCards = [...markedCards];
            newMarkedCards.splice(index, 1);
            
            // 更新存储和状态
            wx.setStorageSync('markedCards', newMarkedCards);
            this.setData({ markedCards: newMarkedCards });
          }
          // 用户点击取消，不执行任何操作
        }
      });
    },

    handleClearAllMarks() {
      // 添加确认提示
      wx.showModal({
        title: '清除全部标记',
        content: '确定要清除所有标记的卡片吗？此操作不可恢复！',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 清空存储
            wx.setStorageSync('markedCards', []);
            // 更新状态
            this.setData({ 
              markedCards: [] 
            });
            // 提示成功
            wx.showToast({
              title: '已清除全部标记',
              icon: 'success',
              duration: 2000
            });
          }
        }
      });
    },

    handleSelectionChange(e: WechatMiniprogram.CheckboxGroupChange) {
      console.log('=== 选择状态变化 ===');
      const selectedIndexes = new Set(e.detail.value.map(v => parseInt(v)));
      console.log('选中的索引:', Array.from(selectedIndexes));
      
      const markedCards = this.data.markedCards.map((card, index) => ({
        ...card,
        selected: selectedIndexes.has(index)
      }));
      
      const selectedCount = selectedIndexes.size;
      const isAllSelected = selectedCount === markedCards.length;
      
      console.log('更新选择状态:', {
        selectedCount,
        isAllSelected,
        selectedCards: markedCards.filter(card => card.selected).map(card => card.question)
      });

      this.setData({ 
        markedCards,
        selectedCount,
        isAllSelected
      });
    },

    handleSelectAll(e: WechatMiniprogram.CheckboxGroupChange) {
      console.log('=== 全选状态变化 ===');
      const isAllSelected = e.detail.value.includes('all');
      console.log('是否全选:', isAllSelected);
      
      const markedCards = this.data.markedCards.map(card => ({
        ...card,
        selected: isAllSelected
      }));

      console.log('更新全选状态:', {
        selectedCount: isAllSelected ? markedCards.length : 0,
        selectedCards: isAllSelected ? markedCards.map(card => card.question) : []
      });

      this.setData({
        markedCards,
        selectedCount: isAllSelected ? markedCards.length : 0,
        isAllSelected
      });
    },

    handleClearSelected() {
      if (!this.data.selectedCount) return;
      
      console.log('=== 准备删除选中项 ===');
      console.log('选中数量:', this.data.selectedCount);
      console.log('选中的卡片:', this.data.markedCards.filter(card => card.selected).map(card => card.question));

      wx.showModal({
        title: '删除选中项',
        content: `确定要删除选中的 ${this.data.selectedCount} 个标记吗？此操作不可恢复！`,
        confirmText: '删除',
        confirmColor: '#e74c3c',
        success: (res) => {
          if (res.confirm) {
            console.log('=== 确认删除选中项 ===');
            const newMarkedCards = this.data.markedCards.filter(card => !card.selected);
            console.log('本地存储剩余卡片数:', newMarkedCards.length);
            
            wx.setStorageSync('markedCards', newMarkedCards);
            this.setData({
              markedCards: newMarkedCards,
              selectedCount: 0,
              isAllSelected: false
            });

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } else {
            console.log('用户取消删除操作');
          }
        }
      });
    }
  }
}); 