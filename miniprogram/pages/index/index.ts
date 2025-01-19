// index.ts
Page({
  data: {
    showSettingsDialog: false,
    apiKey: '',
    tempApiKey: '', // 临时存储编辑中的 API Key
    showApiKey: false // 添加这个字段
  },

  onLoad() {
    const apiKey = wx.getStorageSync('deepseek_api_key') || '';
    this.setData({ apiKey });
  },

  navigateToCards() {
    wx.navigateTo({
      url: '/pages/cards/index',
      fail: (error) => {
        console.error('跳转失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error'
        });
      }
    });
  },

  navigateToFeedback() {
    // wx.navigateTo({ url: '/pages/feedback/index' });
    console.log('跳转到 意见收集箱页面')
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  showSettings() {
    this.setData({
      showSettingsDialog: true,
      tempApiKey: this.data.apiKey
    });
  },

  handleInput(e: WechatMiniprogram.Input) {
    this.setData({
      tempApiKey: e.detail.value
    });
  },

  handleCancel() {
    this.setData({
      showSettingsDialog: false,
      tempApiKey: '',
      showApiKey: false // 关闭弹窗时重置显示状态
    });
  },

  handleConfirm() {
    const apiKey = this.data.tempApiKey.trim();
    wx.setStorageSync('deepseek_api_key', apiKey);
    this.setData({
      apiKey,
      showSettingsDialog: false,
      tempApiKey: ''
    });
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  toggleApiKeyVisibility() {
    this.setData({
      showApiKey: !this.data.showApiKey
    });
  }
})
