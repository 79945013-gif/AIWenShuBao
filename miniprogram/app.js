// AI文书宝 - 微信小程序
// 集小红书文案生成、封面设计、爆款拆解于一体的AI创作工具

const app = getApp();

App({
  globalData: {
    userInfo: null,
    // 豆包API配置 - 火山引擎
    doubao: {
      apiKey: '6d23d85a-6fe4-4497-b74e-f152996b18ad',
      model: 'doubao-1.5-pro-32k-250115',
      apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    },
    // 每日免费次数
    freeLimit: 10,
    // 广告配置
    adUnitId: '',
    // 版本信息
    version: '1.0.0',
    // 合规检测敏感词库
    sensitiveWords: [
      '最', '第一', '国家级', '顶级', '极品', '极佳', '绝佳', '绝佳',
      '绝对', '终极', '至佳', '极佳', '完美', '绝佳', '极佳',
      '全网第一', '全网最佳', '全网最强', '全球第一', '全球最佳',
      '销量第一', '质量第一', '口碑第一', '人气第一',
      '最佳', '最优', '最强', '最好', '最低价', '最高级',
      '第一', '顶级', '极品', '极佳', '绝佳', '国家级',
      '永久', '终身', '一辈子', '100%', '百分之百',
      '无需', '无须', '不必', '不用', '就能', '立竿见影',
      '立即', '马上', '立刻', '瞬间', '秒变', '一天见效',
      '特效', '特效药', '神药', '万能', '包治', '根治',
      '保证', '承诺', '保障', '无效退款', '退款',
      '最好', '最优', '最强', '最佳', '最便宜', '最优惠'
    ]
  },

  onLaunch() {
    // 检查登录状态
    this.checkLogin();
    // 初始化次数
    this.initUsageCount();
    // 检查更新
    this.checkUpdate();
  },

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  initUsageCount() {
    const today = new Date().toDateString();
    const lastDate = wx.getStorageSync('lastUsageDate');
    if (lastDate !== today) {
      wx.setStorageSync('lastUsageDate', today);
      wx.setStorageSync('dailyUsageCount', 0);
    }
  },

  getDailyUsageCount() {
    return wx.getStorageSync('dailyUsageCount') || 0;
  },

  addUsageCount() {
    const count = this.getDailyUsageCount() + 1;
    wx.setStorageSync('dailyUsageCount', count);
    return count;
  },

  canUseFree() {
    return this.getDailyUsageCount() < this.globalData.freeLimit;
  },

  checkUpdate() {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log('有新版本');
      }
    });
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
  },

  // 合规检测
  checkCompliance(text) {
    const sensitiveWords = this.globalData.sensitiveWords;
    const foundWords = [];
    
    for (const word of sensitiveWords) {
      if (text.includes(word)) {
        foundWords.push(word);
      }
    }
    
    return {
      passed: foundWords.length === 0,
      foundWords: foundWords,
      riskLevel: foundWords.length === 0 ? 'low' : foundWords.length <= 3 ? 'medium' : 'high'
    };
  }
});
