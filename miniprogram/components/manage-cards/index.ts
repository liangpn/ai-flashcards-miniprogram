import { FlashCard } from '../../services/ai'

interface GroupedCards {
  topic: string;
  cards: Array<FlashCard & { selected?: boolean }>;
  isExpanded?: boolean;
}

Component({
  data: {
    groupedCards: [] as GroupedCards[],
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
        // 从本地存储获取已标记的卡片
        const markedCards = wx.getStorageSync('markedCards') || [];
        console.log('已标记的卡片:', markedCards);

        // 按 topic 分组
        const groupedMap = new Map<string, Array<FlashCard & { selected?: boolean }>>();
        markedCards.forEach((card: FlashCard & { selected?: boolean }) => {
          const topic = card.topic || '未分类';
          if (!groupedMap.has(topic)) {
            groupedMap.set(topic, []);
          }
          groupedMap.get(topic)?.push({ ...card, selected: false });
        });

        // 转换为数组格式
        const groupedCards = Array.from(groupedMap.entries()).map(([topic, cards]) => ({
          topic,
          cards,
          isExpanded: false // 默认收起
        }));

        console.log('按主题分组后的卡片:', groupedCards);

        this.setData({
          groupedCards,
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

    handleTopicToggle(e: WechatMiniprogram.TouchEvent) {
      const { index } = e.currentTarget.dataset;
      const { groupedCards } = this.data;
      
      // 切换展开状态
      const isExpanding = !groupedCards[index].isExpanded;
      groupedCards[index].isExpanded = isExpanding;
      
      // 如果是收起操作，取消该 topic 下所有卡片的选中状态
      if (!isExpanding) {
        groupedCards[index].cards = groupedCards[index].cards.map(card => ({
          ...card,
          selected: false
        }));
      }
      
      // 计算所有选中的卡片数量
      const selectedCount = groupedCards.reduce((count, group) => 
        count + group.cards.filter(card => card.selected).length, 
        0
      );

      // 计算展开的 topic 下的总卡片数
      const expandedCardsCount = groupedCards.reduce((count, group) => 
        group.isExpanded ? count + group.cards.length : count, 
        0
      );

      // 计算展开的 topic 下的选中数量
      const selectedExpandedCount = groupedCards.reduce((count, group) => 
        group.isExpanded ? count + group.cards.filter(card => card.selected).length : count,
        0
      );

      // 更新全选状态（只考虑展开的 topic）
      const isAllSelected = expandedCardsCount > 0 && selectedExpandedCount === expandedCardsCount;
      
      this.setData({ 
        groupedCards,
        selectedCount,
        isAllSelected
      });
    },

    handleSelectionChange(e: WechatMiniprogram.CheckboxGroupChange) {
      console.log('=== 选择状态变化 ===');
      const selectedValues = new Set(e.detail.value);
      console.log('选中的值:', Array.from(selectedValues));
      
      const groupedCards = this.data.groupedCards.map(group => ({
        ...group,
        cards: group.cards.map(card => ({
          ...card,
          selected: selectedValues.has(`${group.topic}-${card.question}`)
        }))
      }));
      
      // 计算选中数量
      const selectedCount = groupedCards.reduce(
        (count, group) => count + group.cards.filter(card => card.selected).length,
        0
      );

      // 计算展开的 topic 下的总卡片数
      const expandedCardsCount = groupedCards.reduce(
        (count, group) => group.isExpanded ? count + group.cards.length : count,
        0
      );

      // 计算展开的 topic 下的选中数量
      const selectedExpandedCount = groupedCards.reduce(
        (count, group) => group.isExpanded ? count + group.cards.filter(card => card.selected).length : count,
        0
      );

      // 更新全选状态（只考虑展开的 topic）
      const isAllSelected = expandedCardsCount > 0 && selectedExpandedCount === expandedCardsCount;
      
      console.log('更新选择状态:', {
        selectedCount,
        expandedCardsCount,
        selectedExpandedCount,
        isAllSelected
      });

      this.setData({ 
        groupedCards,
        selectedCount,
        isAllSelected
      });
    },

    handleSelectAll(e: WechatMiniprogram.CheckboxGroupChange) {
      console.log('=== 全选状态变化 ===');
      const isAllSelected = e.detail.value.includes('all');
      console.log('是否全选:', isAllSelected);
      
      const groupedCards = this.data.groupedCards.map(group => ({
        ...group,
        cards: group.cards.map(card => ({
          ...card,
          // 只有展开的 topic 下的卡片会被选中，其他都取消选中
          selected: isAllSelected && group.isExpanded
        }))
      }));

      // 计算选中数量（包括所有选中的卡片）
      const selectedCount = groupedCards.reduce(
        (count, group) => count + group.cards.filter(card => card.selected).length,
        0
      );

      console.log('更新全选状态:', {
        selectedCount,
        isAllSelected
      });

      this.setData({
        groupedCards,
        selectedCount,
        isAllSelected
      });
    },

    handleClearSelected() {
      if (!this.data.selectedCount) return;
      
      console.log('=== 准备删除选中项 ===');
      console.log('选中数量:', this.data.selectedCount);

      wx.showModal({
        title: '删除选中项',
        content: `确定要删除选中的 ${this.data.selectedCount} 个标记吗？此操作不可恢复！`,
        confirmText: '删除',
        confirmColor: '#e74c3c',
        success: (res) => {
          if (res.confirm) {
            console.log('=== 确认删除选中项 ===');
            
            // 过滤掉选中的卡片
            const groupedCards = this.data.groupedCards.map(group => ({
              ...group,
              cards: group.cards.filter(card => !card.selected)
            })).filter(group => group.cards.length > 0); // 移除空组
            
            // 更新本地存储
            const allCards = groupedCards.flatMap(group => group.cards);
            wx.setStorageSync('markedCards', allCards);
            
            console.log('本地存储剩余卡片数:', allCards.length);
            
            this.setData({
              groupedCards,
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
    },

    // 阻止事件冒泡的空方法
    // handleGroupTap() {
    //   // 什么都不做，仅用于阻止事件冒泡
    // }
  }
}); 