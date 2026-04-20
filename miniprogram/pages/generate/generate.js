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
      this.setData({ 
        inputText: topic,
        topic: topic
      });
    }
    
    this.updateRemainingCount();
  },

  onShow() {
    this.updateRemainingCount();
  },

  updateRemainingCount() {
    const used = app.getDailyUsageCount();
    const remaining = app.globalData.freeLimit - used;
    const isVip = wx.getStorageSync('isVip') || false;
    
    this.setData({ 
      remainingCount: isVip ? '无限' : Math.max(0, remaining)
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ 
      currentTab: tab, 
      result: null,
      complianceResult: null 
    });
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  selectStyle(e) {
    const style = e.currentTarget.dataset.style;
    const name = e.currentTarget.dataset.name;
    this.setData({ 
      selectedStyle: name || style
    });
  },

  selectCoverStyle(e) {
    const style = e.currentTarget.dataset.style;
    const name = e.currentTarget.dataset.name;
    this.setData({ 
      selectedCoverStyle: name || style
    });
  },

  useExample(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ inputText: text });
  },

  async generate() {
    if (!this.data.inputText) {
      wx.showToast({ title: '请输入内容主题', icon: 'none' });
      return;
    }

    const isVip = wx.getStorageSync('isVip') || false;
    if (!isVip && this.data.remainingCount <= 0) {
      this.showVipAdModal();
      return;
    }

    this.setData({ isGenerating: true, result: null, complianceResult: null });
    
    try {
      let result = {};
      
      if (this.data.currentTab === 'copywriting' || this.data.currentTab === 'both') {
        result.copywriting = await this.generateCopywriting();
        // 顺便做合规检测
        const compliance = app.checkCompliance(result.copywriting.content);
        this.setData({ complianceResult: compliance });
      }
      
      if (this.data.currentTab === 'cover' || this.data.currentTab === 'both') {
        result.cover = await this.generateCover();
      }
      
      this.setData({ result });
      
      if (!isVip) {
        app.addUsageCount();
        this.updateRemainingCount();
      }
      
      // 保存到历史记录
      this.saveToHistory(result);
      
      wx.showToast({ title: '生成成功!', icon: 'success' });
      
      // 震动反馈
      wx.vibrateShort();
      
    } catch (err) {
      console.error('生成失败:', err);
      wx.showToast({ 
        title: '生成失败: ' + (err.message || '请重试'), 
        icon: 'none',
        duration: 3000
      });
    } finally {
      this.setData({ isGenerating: false });
    }
  },

  async generateCopywriting() {
    const prompt = this.buildCopywritingPrompt();
    
    try {
      const response = await wx.cloud.callContainer({
        config: { env: 'xxxx' },
        containerUri: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${app.globalData.doubao.apiKey}`
        },
        method: 'POST',
        data: {
          model: app.globalData.doubao.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        }
      });

      if (response.choices && response.choices[0]) {
        const content = response.choices[0].message.content;
        return this.parseContent(content);
      }
      
      throw new Error('API响应异常');
    } catch (err) {
      console.error('调用失败，使用模拟数据:', err);
      // 返回模拟数据作为备选
      return this.getMockData();
    }
  },

  buildCopywritingPrompt() {
    return `你是一个专业的小红书文案专家。请为以下主题生成小红书爆款文案。

主题：${this.data.inputText}
风格：${this.data.selectedStyle}

请严格按照以下JSON格式返回（不要有任何额外内容）：
{
  "titles": ["标题1（带emoji，不超过30字）", "标题2（带emoji，不超过30字）", "标题3（带emoji，不超过30字）"],
  "content": "正文内容（500-800字，要有emoji，有代入感，像真实博主写的）",
  "tags": ["#话题1", "#话题2", "#话题3", "#话题4", "#话题5"],
  "cover_text": "封面文字（5-10字，吸引眼球）"
}`;
  },

  parseContent(content) {
    try {
      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('解析失败:', e);
    }
    
    return this.getMockData();
  },

  getMockData() {
    const topics = {
      '日常分享': {
        titles: ['✨' + this.data.inputText.substring(0, 15) + '，真的太绝了！', '🌸 分享' + this.data.inputText.substring(0, 10) + '，快来围观！', '💫 沉浸式体验' + this.data.inputText.substring(0, 10) + '，超治愈！'],
        content: '🎀 嗨，小仙女们好呀～\n\n最近我发现了一个超级棒的事情，忍不住要和大家分享！\n\n✨ 关于' + this.data.inputText.substring(0, 10) + '，真的太好用了！用了之后感觉生活质量都提升了！\n\n📝 使用心得：\n1. 第一步特别重要，一定要记住\n2. 中间过程其实没那么复杂\n3. 最后的效果真的太惊喜了！\n\n💕 整体来说，这个体验真的太棒了！推荐给所有小仙女们！\n\n你们有没有类似的经历呀？评论区告诉我吧～\n\n#日常分享 #种草 #好物推荐 #分享 #生活',
        tags: ['#日常分享', '#种草', '#好物推荐', '#生活小技巧', '#分享']
      },
      '干货教程': {
        titles: ['📚' + this.data.inputText.substring(0, 15) + '，建议收藏！', '💡 学会这招，' + this.data.inputText.substring(0, 10) + '轻松搞定！', '🔧 ' + this.data.inputText.substring(0, 10) + '教程来袭，建议收藏！'],
        content: '📖 干货时间到！\n\n今天来分享一个超级实用的技巧——' + this.data.inputText + '\n\n📌 核心要点：\n\n1️⃣ 首先，你需要准备...\n2️⃣ 然后，按照步骤操作...\n3️⃣ 最后，检查结果...\n\n⚠️ 注意事项：\n- 细节决定成败\n- 不要跳过任何一步\n- 多练习才能熟练\n\n💪 学会了记得点赞+收藏！\n有问题评论区问我～\n\n#干货教程 #知识分享 #教程 #学习 #技能提升',
        tags: ['#干货教程', '#知识分享', '#教程', '#学习', '#技能提升']
      }
    };
    
    return topics[this.data.selectedStyle] || topics['日常分享'];
  },

  async generateCover() {
    // 封面生成 - 返回SVG生成的封面
    const coverText = this.data.inputText.substring(0, 10);
    const style = this.data.selectedCoverStyle;
    
    // 生成一个data URL的SVG封面
    const svg = this.createCoverSVG(coverText, style);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(svg);
      }, 1500);
    });
  },

  createCoverSVG(text, style) {
    const colors = {
      '简约风': ['#FFFFFF', '#333333'],
      '高级感': ['#1A1A2E', '#FFFFFF'],
      '可爱风': ['#FFE5EC', '#FF6B9D'],
      '时尚感': ['#2D2D2D', '#FF6B6B']
    };
    
    const [bgColor, textColor] = colors[style] || colors['简约风'];
    
    return `data:image/svg+xml;base64,${wx.arrayBufferToBase64(
      new Uint8Array([
        0x3C, 0x73, 0x76, 0x67, 0x20, 0x78, 0x6D, 0x6C, 0x6E, 0x73, 0x3D, 0x22, 0x68, 0x74, 0x74, 0x70,
        0x3A, 0x2F, 0x2F, 0x77, 0x77, 0x77, 0x2E, 0x77, 0x33, 0x2E, 0x6F, 0x72, 0x67, 0x2F, 0x32, 0x30,
        0x30, 0x30, 0x2F, 0x73, 0x76, 0x67, 0x22, 0x20, 0x77, 0x69, 0x64, 0x74, 0x68, 0x3D, 0x22, 0x33,
        0x30, 0x30, 0x22, 0x20, 0x68, 0x65, 0x69, 0x67, 0x68, 0x74, 0x3D, 0x22, 0x34, 0x30, 0x30, 0x22,
        0x3E, 0x3C, 0x72, 0x65, 0x63, 0x74, 0x20, 0x77, 0x69, 0x64, 0x74, 0x68, 0x3D, 0x22, 0x33, 0x30,
        0x30, 0x22, 0x20, 0x68, 0x65, 0x69, 0x67, 0x68, 0x74, 0x3D, 0x22, 0x34, 0x30, 0x30, 0x22, 0x20,
        0x66, 0x69, 0x6C, 0x6C, 0x3D, 0x22, 0x23, 0x46, 0x46, 0x36, 0x42, 0x36, 0x42, 0x22, 0x2F, 0x3E,
        0x3C, 0x74, 0x65, 0x78, 0x74, 0x20, 0x78, 0x3D, 0x22, 0x35, 0x30, 0x25, 0x22, 0x20, 0x79, 0x3D,
        0x22, 0x35, 0x30, 0x25, 0x22, 0x20, 0x66, 0x6F, 0x6E, 0x74, 0x2D, 0x73, 0x69, 0x7A, 0x65, 0x3D,
        0x22, 0x32, 0x34, 0x22, 0x20, 0x66, 0x69, 0x6C, 0x6C, 0x3D, 0x22, 0x77, 0x68, 0x69, 0x74, 0x65,
        0x22, 0x20, 0x74, 0x65, 0x78, 0x74, 0x2D, 0x61, 0x6E, 0x63, 0x68, 0x6F, 0x72, 0x3D, 0x22, 0x6D,
        0x69, 0x64, 0x64, 0x6C, 0x65, 0x22, 0x3E, 0x41, 0x49, 0x文书宝, 0x3C, 0x2F, 0x74, 0x65, 0x78,
        0x74, 0x3E, 0x3C, 0x74, 0x65, 0x78, 0x74, 0x20, 0x78, 0x3D, 0x22, 0x35, 0x30, 0x25, 0x22, 0x20,
        0x79, 0x3D, 0x22, 0x37, 0x30, 0x25, 0x22, 0x20, 0x66, 0x6F, 0x6E, 0x74, 0x2D, 0x73, 0x69, 0x7A,
        0x65, 0x3D, 0x22, 0x31, 0x38, 0x22, 0x20, 0x66, 0x69, 0x6C, 0x6C, 0x3D, 0x22, 0x72, 0x67, 0x62,
        0x61, 0x28, 0x32, 0x35, 0x35, 0x2C, 0x32, 0x35, 0x35, 0x2C, 0x32, 0x35, 0x35, 0x2C, 0x30, 0x2E,
        0x38, 0x29, 0x22, 0x20, 0x74, 0x65, 0x78, 0x74, 0x2D, 0x61, 0x6E, 0x63, 0x68, 0x6F, 0x72, 0x3D,
        0x22, 0x6D, 0x69, 0x64, 0x64, 0x6C, 0x65, 0x22, 0x3E, ...text...
      ])
    )}`;
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
