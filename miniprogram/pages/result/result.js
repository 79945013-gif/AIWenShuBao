// pages/result/result.js
Page({
  data: {
    result: null,
    input: '',
    type: '',
    style: ''
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.loadResult(id);
    }
  },

  loadResult(id) {
    const history = wx.getStorageSync('history') || [];
    const item = history.find(h => h.id == id);
    if (item) {
      this.setData({
        result: item.result,
        input: item.input,
        type: item.type,
        style: item.style
      });
    } else {
      wx.showToast({ title: '记录不存在', icon: 'none' });
      wx.navigateBack();
    }
  },

  copyAll() {
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

  goToGenerate() {
    wx.switchTab({ url: '/pages/generate/generate' });
  }
});
