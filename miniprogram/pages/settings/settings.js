// pages/settings/settings.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isVip: false,
    totalCount: 0,
    todayCount: 0,
    notificationEnabled: true,
    soundEnabled: true,
    autoSave: true,
    showVersion: 'v1.0.0',
    appFeatures: [
      { icon: '📝', name: 'AI文案生成', desc: '一键生成爆款标题和正文' },
      { icon: '🖼️', name: 'AI封面设计', desc: '智能生成精美封面图' },
      { icon: '🔍', name: '爆款拆解', desc: '分析爆款笔记结构' },
      { icon: '✅', name: '合规检测', desc: '自动检测违规词' }
    ],
    vipFeatures: [
      { icon: '♾️', name: '无限使用', desc: '无限制使用所有功能' },
      { icon: '🎨', name: '高级模板', desc: '解锁更多专业模板' },
      { icon: '⚡', name: '优先体验', desc: '第一时间体验新功能' },
      { icon: '🚫', name: '无广告', desc: '告别所有广告打扰' }
    ]
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    const totalCount = wx.getStorageSync('totalUsageCount') || 0;
    const todayCount = app.getDailyUsageCount();
    const notification = wx.getStorageSync('notificationEnabled');
    const sound = wx.getStorageSync('soundEnabled');
    const autoSave = wx.getStorageSync('autoSave');
    
    this.setData({
      userInfo: userInfo,
      totalCount: totalCount,
      todayCount: todayCount,
      notificationEnabled: notification !== false,
      soundEnabled: sound !== false,
      autoSave: autoSave !== false,
      isVip: wx.getStorageSync('isVip') || false,
      showVersion: app.globalData.version
    });
  },

  goToVip() {
    wx.showModal({
      title: '开通Pro会员',
      content: `AI文书宝Pro会员

✅ 无限次使用所有功能
✅ 解锁高级模板
✅ 优先体验新功能
✅ 去除所有广告

限时优惠：¥29/月
原价：¥99/月`,
      confirmText: '立即开通',
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          this.activateVip();
        }
      }
    });
  },

  activateVip() {
    wx.setStorageSync('isVip', true);
    wx.setStorageSync('vipExpireDate', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    this.loadData();
    wx.showToast({ 
      title: '开通成功！', 
      icon: 'success',
      duration: 2000
    });
  },

  clearHistory() {
    wx.showModal({
      title: '清空历史',
      content: '确定要清空所有历史记录吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('history');
          wx.removeStorageSync('analyzeHistory');
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  clearCache() {
    wx.showModal({
      title: '清理缓存',
      content: '确定要清理本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '缓存已清理', icon: 'success' });
        }
      }
    });
  },

  toggleSetting(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    wx.setStorageSync(key, value);
    this.setData({ [key]: value });
  },

  checkUpdate() {
    wx.showToast({ title: '当前已是最新版本', icon: 'success' });
  },

  showHelp() {
    wx.showModal({
      title: '使用帮助',
      content: `📖 AI文书宝使用指南

【AI文案生成】
1. 输入内容主题或关键词
2. 选择合适的风格
3. 点击生成按钮
4. 一键复制发布

【AI封面生成】
1. 输入封面主题
2. 选择封面风格
3. 点击生成
4. 长按保存图片

【爆款拆解】
1. 粘贴小红书笔记链接
2. 点击开始分析
3. 查看详细分析报告
4. 根据建议优化内容

【合规检测】
生成文案时会自动检测，标记可能违规的词汇`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  feedback() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的反馈！请描述您遇到的问题或建议：',
      editable: true,
      placeholderText: '请输入您的反馈...',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.showToast({ title: '感谢反馈！', icon: 'success' });
        }
      }
    });
  },

  about() {
    wx.showModal({
      title: '关于我们',
      content: `AI文书宝 ${this.data.showVersion}

一款专注于小红书内容创作的AI工具

✨ 核心功能
• AI文案生成 - 一键生成爆款标题和正文
• AI封面设计 - 智能生成精美封面
• 爆款拆解 - 分析爆款笔记结构
• 合规检测 - 自动检测违规词

📧 联系我们
support@aiwenshubao.com

💡 如果觉得好用，请分享给朋友！`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI文书宝 - 小红书爆款文案一键生成',
      path: '/pages/home/home',
      imageUrl: '/assets/images/share.png'
    };
  },

  rateApp() {
    wx.showToast({ title: '感谢您的支持！', icon: 'success' });
  }
});
