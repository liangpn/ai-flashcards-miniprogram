Component({
  data: {
    isOpen: false,
    apiKey: '',
    saveSuccess: false
  },

  lifetimes: {
    attached() {
      const apiKey = wx.getStorageSync('deepseek_api_key') || '';
      this.setData({ apiKey });
    }
  },

  methods: {
    toggleDialog() {
      this.setData({
        isOpen: !this.data.isOpen,
        saveSuccess: false
      });
    },

    handleInput(e: WechatMiniprogram.Input) {
      this.setData({
        apiKey: e.detail.value
      });
    },

    handleSave() {
      wx.setStorageSync('deepseek_api_key', this.data.apiKey);
      this.setData({ saveSuccess: true });
      
      // 通知父组件 API Key 已更新
      this.triggerEvent('apiKeyChange', { apiKey: this.data.apiKey });

      // 1.5秒后关闭对话框
      setTimeout(() => {
        this.setData({
          isOpen: false,
          saveSuccess: false
        });
      }, 1500);
    }
  }
}); 