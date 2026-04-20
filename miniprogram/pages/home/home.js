// pages/home/home.js
const app = getApp();

Page({
  data: {
    dailyCount: 0,
    totalCount: 0,
    freeLimit: 10,
    isVip: false,
    banners: [
      { id: 1, image: '/assets/images/banner1.png', title: 'AI文案生成', subtitle: '一键生成爆款标题' },
      { id: 2, image: '/assets/images/banner2.png', title: '封面设计', subtitle: '精美封面自动生成' }
    ],
    hotTopics: [
      { name: '#春季穿搭', count: '100万+' },
      { name: '#美妆教程', count: '80万+' },
      { name: '#美食分享', count: '120万+' },
      { name: '#旅行打卡', count: '60万+' },
      { name: '#家居好物', count: '50万+' },
      { name: '#职场干货', count: '40万+' }
    ],
    templates: [
      { id: 1, name: '日常分享', icon: '🌸', color: '#FFB6C1' },
      { id: 2, name: '干货教程', icon: '📚', color: '#87CEEB' },
      { id: 3, name: '种草推荐', icon: '💖', color: '#FF6B6B' },
      { id: 4, name: '情感共鸣', icon: '💭', color: '#DDA0DD' },
      { id: 5, name: '搞笑幽默', icon: '😄', color: '#FFD700' },
      { id: 6, name: '探店打卡', icon: '📍', color: '#98FB98' }
    ]
  },

  onLoad() {
    this.updateStats();
    this.checkVip();
  },

  onShow() {
    this.updateStats();
    this.checkVip();
  },

  onPullDownRefresh() {
    this.updateStats();
    wx.stopPullDownRefresh();
  },

  updateStats() {
    const used = app.getDailyUsageCount();
    const total = wx.getStorageSync('totalUsageCount') || 0;
    this.setData({
      dailyCount: this.data.freeLimit - used,
      totalCount: total,
      freeLimit: this.data.freeLimit
    });
  },

  checkVip() {
    const isVip = wx.getStorageSync('isVip') || false;
    this.setData({ isVip });
  },

  goToGenerate(e) {
    const type = e.currentTarget.dataset.type || 'both';
    const style = e.currentTarget.dataset.style;
    
    let url = `/pages/generate/generate?type=${type}`;
    if (style) {
      url += `&style=${style}`;
    }
    
    wx.navigateTo({ url });
  },

  goToAnalyze() {
    wx.switchTab({ url: '/pages/analyze/analyze' });
  },

  useTemplate(e) {
    const style = e.currentTarget.dataset.style;
    const name = e.currentTarget.dataset.name;
    
    wx.navigateTo({
      url: `/pages/generate/generate?type=copywriting&style=${style}&topic=${name}`
    });
  },

  checkCompliance() {
    wx.navigateTo({
      url: '/pages/generate/generate?type=check'
    });
  },

  goToVip() {
    wx.navigateTo({ url: '/pages/settings/settings' });
    // 滚动到会员区域
    setTimeout(() => {
      wx.showModal({
        title: '开通会员',
        content: 'AI文书宝Pro会员\n\n✅ 每日无限次使用\n✅ 专属高级模板\n✅ 优先使用最新AI模型\n✅ 去除所有广告\n\n原价 ¥99/月，限时 ¥29/月',
        confirmText: '立即开通',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            // 模拟开通
            wx.setStorageSync('isVip', true);
            wx.showToast({ title: '开通成功！', icon: 'success' });
            this.checkVip();
          }
        }
      });
    }, 500);
  },

  shareToFriend() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI文书宝 - 小红书爆款文案一键生成',
      path: '/pages/home/home',
      imageUrl: '/assets/images/share.png'
    };
  },

  onShareTimeline() {
    return {
      title: 'AI文书宝 - 小红书爆款文案一键生成',
      query: 'from=timeline'
    };
  }
});
