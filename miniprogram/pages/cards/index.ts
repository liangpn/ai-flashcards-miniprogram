Component({
  data: {
    currentTab: 'custom'
  },

  lifetimes: {
    attached() {
      console.log('=== Cards Page Attached ===');
      this.resetState();
    }
  },

  pageLifetimes: {
    show() {
      this.resetState();
    }
  },

  methods: {
    resetState() {
      console.log('=== 重置状态 ===');
      this.setData({
        currentTab: 'custom'
      });
    },

    handleBack() {
      console.log('cards page: handleBack called');
      wx.redirectTo({
        url: '/pages/index/index',
        success: () => {
          console.log('cards page: navigation success, resetting state');
          this.resetState();
        },
        fail: (error) => {
          console.error('cards page: navigation failed', error);
          wx.showToast({
            title: '返回失败',
            icon: 'error'
          });
        }
      });
    },

    switchTab(e: WechatMiniprogram.TouchEvent) {
      const { tab } = e.currentTarget.dataset;
      console.log('=== 切换标签 ===');
      console.log('目标标签:', tab);
      
      if (this.data.currentTab === tab) {
        console.log('已经在当前标签，不需要切换');
        return;
      }

      this.setData({ 
        currentTab: tab
      }, () => {
        console.log('标签切换完成:', this.data.currentTab);
      });
    }
  }
}); 