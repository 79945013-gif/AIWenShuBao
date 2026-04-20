// pages/history/history.js
Page({
  data: {
    historyList: [],
    filterType: 'all',
    filterTypes: [
      { name: '全部', value: 'all' },
      { name: '文案', value: 'copywriting' },
      { name: '封面', value: 'cover' },
      { name: '全套', value: 'both' }
    ]
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  onPullDownRefresh() {
    this.loadHistory();
    wx.stopPullDownRefresh();
  },

  loadHistory() {
    const history = wx.getStorageSync('history') || [];
    this.setData({ historyList: history });
  },

  getFilteredList() {
    if (this.data.filterType === 'all') {
      return this.data.historyList;
    }
    return this.data.historyList.filter(item => item.type === this.data.filterType);
  },

  setFilter(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ filterType: type });
  },

  getTypeName(type) {
    const names = {
      copywriting: '📝 文案',
      cover: '🖼️ 封面',
      both: '✨ 全套'
    };
    return names[type] || '全部';
  },

  formatTime(timeStr) {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.historyList.find(h => h.id === id);
    if (item) {
      wx.navigateTo({
        url: `/pages/result/result?id=${id}`
      });
    }
  },

  deleteItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const history = wx.getStorageSync('history') || [];
          const newHistory = history.filter(item => item.id !== id);
          wx.setStorageSync('history', newHistory);
          this.loadHistory();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  copyItem(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.historyList.find(h => h.id === id);
    if (item && item.result && item.result.copywriting) {
      const c = item.result.copywriting;
      const text = `📌 ${c.titles[0]}\n\n${c.content}\n\n${c.tags.join(' ')}`;
      wx.setClipboardData({
        data: text,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success' });
        }
      });
    }
  },

  clearAll() {
    wx.showModal({
      title: '清空历史',
      content: '确定要清空所有历史记录吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('history');
          this.loadHistory();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  goToGenerate() {
    wx.switchTab({ url: '/pages/generate/generate' });
  }
});
