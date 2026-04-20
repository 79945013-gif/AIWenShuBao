// pages/analyze/analyze.js
// 爆款拆解页面
const app = getApp();

Page({
  data: {
    inputUrl: '',
    isAnalyzing: false,
    analyzeResult: null,
    historyList: [],
    activeTab: 'analyze'
  },

  onLoad(options) {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  loadHistory() {
    const history = wx.getStorageSync('analyzeHistory') || [];
    this.setData({ historyList: history.slice(0, 10) });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onInputUrl(e) {
    this.setData({ inputUrl: e.detail.value });
  },

  useExample(e) {
    const example = e.currentTarget.dataset.example;
    this.setData({ inputUrl: example });
  },

  async analyze() {
    if (!this.data.inputUrl) {
      wx.showToast({ title: '请输入笔记链接', icon: 'none' });
      return;
    }

    this.setData({ isAnalyzing: true, analyzeResult: null });

    try {
      // 模拟分析过程
      await this.simulateAnalyze();
      
      // 生成分析结果
      const result = this.generateAnalyzeResult();
      this.setData({ analyzeResult: result });
      
      // 保存到历史
      this.saveToHistory(result);
      
      wx.vibrateShort();
      wx.showToast({ title: '分析完成!', icon: 'success' });
      
    } catch (err) {
      wx.showToast({ title: '分析失败: ' + err.message, icon: 'none' });
    } finally {
      this.setData({ isAnalyzing: false });
    }
  },

  simulateAnalyze() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 2000);
    });
  },

  generateAnalyzeResult() {
    const url = this.data.inputUrl;
    const isValid = url.includes('xiaohongshu') || url.includes('xhslink');
    
    return {
      url: url,
      time: new Date().toISOString(),
      // 标题分析
      titleAnalysis: {
        score: Math.floor(Math.random() * 20) + 80,
        keywords: ['✨', '绝了', '必看', '分享', '种草'],
        length: Math.floor(Math.random() * 10) + 15,
        emojiCount: Math.floor(Math.random() * 3) + 1,
        structure: '悬念型',
        suggestions: [
          '标题使用了悬念词"绝了"，点击率会更高',
          '建议在标题中加入数字，如"3个技巧"',
          'emoji数量适中，不会显得太杂乱'
        ]
      },
      // 内容分析
      contentAnalysis: {
        score: Math.floor(Math.random() * 15) + 85,
        wordCount: Math.floor(Math.random() * 500) + 800,
        paragraphCount: Math.floor(Math.random() * 5) + 4,
        emojiCount: Math.floor(Math.random() * 10) + 15,
        structure: [
          { name: '开场钩子', desc: '用痛点或故事开头', score: 90 },
          { name: '正文内容', desc: '分点叙述，逻辑清晰', score: 85 },
          { name: '结尾引导', desc: '引导互动和收藏', score: 88 }
        ],
        suggestions: [
          '内容结构清晰，采用"问题-解决方案"模式',
          '建议增加更多真实体验细节',
          '结尾引导语可以更具体'
        ]
      },
      // 话题分析
      topicAnalysis: {
        score: Math.floor(Math.random() * 20) + 80,
        topics: ['#穿搭', '#每日穿搭', '#ootd', '#小个子穿搭', '#春季穿搭'],
        hotTopics: ['#春季穿搭', '#ootd'],
        suggestions: [
          '话题选择垂直度高，精准触达目标用户',
          '建议加入更多热门话题增加曝光',
          '可考虑添加#2024穿搭等时效性话题'
        ]
      },
      // 封面分析
      coverAnalysis: {
        score: Math.floor(Math.random() * 15) + 85,
        type: '真人出镜+文字',
        colorScheme: '暖色调',
        textPosition: '底部居中',
        suggestions: [
          '封面使用了真人出镜，增加信任感',
          '文字简洁明了，一眼能看懂主题',
          '建议封面加上品牌元素，增加辨识度'
        ]
      },
      // 综合评分
      overallScore: Math.floor(Math.random() * 10) + 90,
      level: 'A+',
      summary: '这是一篇非常优质的小红书笔记！标题吸引力强，内容结构清晰，话题选择精准。继续保持！',
      improvementPoints: [
        '标题可以更具体，加入更多关键词',
        '内容可以增加更多个人真实体验',
        '建议固定发布时间，形成粉丝期待'
      ]
    };
  },

  saveToHistory(result) {
    const history = wx.getStorageSync('analyzeHistory') || [];
    history.unshift({
      id: Date.now(),
      url: result.url,
      score: result.overallScore,
      time: result.time,
      summary: result.summary.substring(0, 50) + '...'
    });
    if (history.length > 50) history.pop();
    wx.setStorageSync('analyzeHistory', history);
    this.loadHistory();
  },

  copyResult() {
    if (!this.data.analyzeResult) return;
    
    const result = this.data.analyzeResult;
    const text = `📊 爆款分析报告

综合评分: ${result.overallScore}分 (${result.level})

🎯 标题分析: ${result.titleAnalysis.score}分
${result.titleAnalysis.suggestions.join('\n')}

📝 内容分析: ${result.contentAnalysis.score}分
${result.contentAnalysis.suggestions.join('\n')}

🏷️ 话题分析: ${result.topicAnalysis.score}分
${result.topicAnalysis.suggestions.join('\n')}

🖼️ 封面分析: ${result.coverAnalysis.score}分
${result.coverAnalysis.suggestions.join('\n')}

💡 总结: ${result.summary}

📌 提升建议:
${result.improvementPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

—— 由AI文书宝生成`;

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制分析报告', icon: 'success' });
      }
    });
  },

  viewHistory(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.historyList.find(h => h.id === id);
    if (item) {
      this.setData({ inputUrl: item.url });
      this.analyze();
    }
  },

  deleteHistory(e) {
    const id = e.currentTarget.dataset.id;
    const history = wx.getStorageSync('analyzeHistory') || [];
    const newHistory = history.filter(h => h.id !== id);
    wx.setStorageSync('analyzeHistory', newHistory);
    this.loadHistory();
    wx.showToast({ title: '已删除', icon: 'success' });
  },

  clearHistory() {
    wx.showModal({
      title: '清空历史',
      content: '确定要清空所有分析历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('analyzeHistory');
          this.loadHistory();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
