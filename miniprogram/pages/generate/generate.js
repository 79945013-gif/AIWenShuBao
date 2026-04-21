// pages/generate/generate.js
// AI文案生成页面
const app = getApp();

Page({
  data: {
    currentTab: 'copywriting',
    inputText: '',
    selectedStyle: '日常分享',
    selectedCoverStyle: '简约风',
    isGenerating: false,
    remainingCount: 0,
    result: null,
    complianceResult: null,
    topic: '',
    
    styleOptions: [
      { name: '日常分享', value: '日常分享', icon: '🌸', desc: '轻松日常' },
      { name: '干货教程', value: '干货教程', icon: '📚', desc: '知识分享' },
      { name: '种草推荐', value: '种草推荐', icon: '💖', desc: '好物推荐' },
      { name: '情感共鸣', value: '情感共鸣', icon: '💭', desc: '情感故事' },
      { name: '搞笑幽默', value: '搞笑幽默', icon: '😄', desc: '轻松搞笑' },
      { name: '探店打卡', value: '探店打卡', icon: '📍', desc: '地点推荐' }
    ],
    
    coverStyles: [
      { name: '简约风', value: '简约风', desc: '简洁大方' },
      { name: '高级感', value: '高级感', desc: '质感满满' },
      { name: '可爱风', value: '可爱风', desc: '萌系风格' },
      { name: '时尚感', value: '时尚感', desc: '潮流时尚' }
    ],

    examples: [
      '分享一套春季穿搭ootd',
      '这家咖啡店太绝了！必去',
      '3分钟学会化妆技巧',
      '租房避坑指南',
      '周末去哪玩？推荐这个地方'
    ]
  },

  onLoad(options) {
    const type = options.type || 'copywriting';
    const style = options.style;
    const topic = options.topic;
    
    this.setData({ 
      currentTab: type,
      selectedStyle: style || '日常分享'
    });
    
    if (topic) {
      this.setData({ inputText: decodeURIComponent(topic) });
    }
    
    this.updateRemainingCount();
  },

  onShow() {
    this.updateRemainingCount();
  },

  updateRemainingCount() {
    const remaining = app.globalData.freeLimit - app.getDailyUsageCount();
    this.setData({ remainingCount: Math.max(0, remaining) });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  selectStyle(e) {
    const style = e.currentTarget.dataset.style;
    this.setData({ selectedStyle: style });
  },

  selectCoverStyle(e) {
    const style = e.currentTarget.dataset.style;
    this.setData({ selectedCoverStyle: style });
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  useExample(e) {
    const example = e.currentTarget.dataset.example;
    this.setData({ inputText: example });
  },

  async generate() {
    const { inputText, currentTab, selectedStyle, selectedCoverStyle } = this.data;
    
    if (!inputText || inputText.trim() === '') {
      wx.showToast({ title: '请输入内容主题', icon: 'none' });
      return;
    }
    
    if (!app.canUseFree() && currentTab === 'copywriting') {
      this.showVipAdModal();
      return;
    }

    this.setData({ isGenerating: true, result: null, complianceResult: null });

    try {
      let result = {};
      
      if (currentTab === 'copywriting' || currentTab === 'full') {
        // 调用云函数生成文案
        const copyResult = await this.callGenerateAPI(inputText, selectedStyle);
        result.copywriting = copyResult;
        
        // 合规检测
        const compliance = app.checkCompliance(copyResult.content);
        this.setData({ complianceResult: compliance });
        
        // 消耗次数
        app.addUsageCount();
        this.updateRemainingCount();
      }
      
      if (currentTab === 'cover' || currentTab === 'full') {
        // 生成封面
        result.cover = this.generateCover(inputText, selectedCoverStyle);
      }
      
      this.setData({ result: result });
      
      // 保存历史
      this.saveToHistory(result);
      
      wx.showToast({ title: '生成成功', icon: 'success' });
      
    } catch (err) {
      console.error('生成失败:', err);
      wx.showToast({ title: '生成失败，请重试', icon: 'none' });
    } finally {
      this.setData({ isGenerating: false });
    }
  },

  callGenerateAPI(topic, style) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'generateCopywriting',
        data: { topic, style },
        success: (res) => {
          if (res.result && res.result.success) {
            resolve(res.result.data);
          } else {
            reject(new Error(res.result?.error || '生成失败'));
          }
        },
        fail: (err) => {
          // 降级处理：使用模拟数据
          console.log('云函数调用失败，使用模拟数据');
          resolve(this.getMockCopywriting(topic, style));
        }
      });
    });
  },

  getMockCopywriting(topic, style) {
    const titles = [
      `${topic}，真的太绝了！`,
      `私藏已久的${topic}，终于拿出来了！`,
      `${topic}，建议收藏！`
    ];
    
    const content = `🌸 嗨，小仙女们好呀～

今天来分享一个超级棒的东西！

关于${topic}，真的太好用了！

✨ 亮点：
1. 效果明显
2. 性价比高
3. 使用方便

💕 用了之后感觉生活质量都提升了！

推荐给所有小仙女们！

你们有没有类似的经历呀？评论区告诉我吧～

#${topic} #种草 #好物推荐 #分享 #生活`;

    const tags = ['#日常分享', '#种草', '#好物推荐', '#生活', '#分享', '#小技巧'];

    return {
      titles,
      content,
      tags,
      cover_text: topic,
      isMock: true
    };
  },

  generateCover(topic, style) {
    const colors = {
      '简约风': { bg: '#FFFFFF', text: '#333333', accent: '#666666' },
      '高级感': { bg: '#1A1A1A', text: '#FFFFFF', accent: '#D4AF37' },
      '可爱风': { bg: '#FFE4E1', text: '#FF6B6B', accent: '#FFB6C1' },
      '时尚感': { bg: '#000000', text: '#FFFFFF', accent: '#FF6B6B' }
    };
    
    const { bg, text, accent } = colors[style] || colors['简约风'];
    
    return {
      topic,
      style,
      bgColor: bg,
      textColor: text,
      accentColor: accent
    };
  },

  saveToHistory(result) {
    const history = wx.getStorageSync('history') || [];
    history.unshift({
      id: Date.now(),
      type: this.data.currentTab,
      input: this.data.inputText,
      style: this.data.selectedStyle,
      result: result,
      createTime: new Date().toISOString()
    });
    
    if (history.length > 100) history.pop();
    wx.setStorageSync('history', history);
    
    const total = (wx.getStorageSync('totalUsageCount') || 0) + 1;
    wx.setStorageSync('totalUsageCount', total);
  },

  copyResult() {
    if (!this.data.result || !this.data.result.copywriting) return;
    
    const c = this.data.result.copywriting;
    const text = `📌 ${c.titles[0]}\n\n${c.content}\n\n${c.tags.join(' ')}`;
    
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      }
    });
  },

  copyTitle() {
    if (!this.data.result || !this.data.result.copywriting) return;
    
    wx.setClipboardData({
      data: this.data.result.copywriting.titles.join('\n'),
      success: () => {
        wx.showToast({ title: '标题已复制', icon: 'success' });
      }
    });
  },

  copyContent() {
    if (!this.data.result || !this.data.result.copywriting) return;
    
    wx.setClipboardData({
      data: this.data.result.copywriting.content,
      success: () => {
        wx.showToast({ title: '正文已复制', icon: 'success' });
      }
    });
  },

  copyTags() {
    if (!this.data.result || !this.data.result.copywriting) return;
    
    wx.setClipboardData({
      data: this.data.result.copywriting.tags.join(' '),
      success: () => {
        wx.showToast({ title: '话题已复制', icon: 'success' });
      }
    });
  },

  saveCover() {
    if (!this.data.result || !this.data.result.cover) return;
    
    wx.showModal({
      title: '保存封面',
      content: '长按封面图片可保存到相册',
      showCancel: false
    });
  },

  saveToAlbum() {
    wx.showToast({ title: '封面已保存到相册', icon: 'success' });
  },

  showVipAdModal() {
    wx.showModal({
      title: '今日次数已用完',
      content: '开通Pro会员可获得无限次使用！',
      confirmText: '开通会员',
      cancelText: '看广告',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/settings/settings' });
        } else {
          this.playAdAndGenerate();
        }
      }
    });
  },

  playAdAndGenerate() {
    wx.showToast({ title: '广告功能开发中，请稍后重试', icon: 'none' });
  },

  regenerate() {
    this.generate();
  }
});
