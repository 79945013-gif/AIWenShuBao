/**
 * AI文书宝 - 工具函数
 */

/**
 * 格式化日期
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute);
}

/**
 * 相对时间
 */
function formatRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
  
  return formatDate(date, 'MM-DD HH:mm');
}

/**
 * 防抖函数
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 */
function throttle(fn, delay = 300) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last > delay) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 复制到剪贴板
 */
function copyToClipboard(text, showToast = true) {
  wx.setClipboardData({
    data: text,
    success: () => {
      if (showToast) {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    },
    fail: () => {
      if (showToast) {
        wx.showToast({ title: '复制失败', icon: 'none' });
      }
    }
  });
}

/**
 * 深拷贝
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const copy = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = deepClone(obj[key]);
      }
    }
    return copy;
  }
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 验证URL
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查小红书链接
 */
function isXiaoHongShuUrl(url) {
  return url.includes('xiaohongshu.com') || url.includes('xhslink');
}

/**
 * 截断文本
 */
function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 获取文字字节长度
 */
function getByteLength(str) {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      len += 2;
    } else {
      len++;
    }
  }
  return len;
}

/**
 * 震动反馈
 */
function vibrate() {
  wx.vibrateShort({ type: 'light' });
}

/**
 * 显示加载提示
 */
function showLoading(title = '加载中...') {
  wx.showLoading({ title, mask: true });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示成功提示
 */
function showSuccess(title = '成功') {
  wx.showToast({ title, icon: 'success' });
}

/**
 * 显示错误提示
 */
function showError(title = '出错了') {
  wx.showToast({ title, icon: 'none' });
}

/**
 * 确认对话框
 */
function confirm(options) {
  return new Promise((resolve) => {
    wx.showModal({
      title: options.title || '提示',
      content: options.content || '',
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
}

module.exports = {
  formatDate,
  formatRelativeTime,
  debounce,
  throttle,
  copyToClipboard,
  deepClone,
  generateId,
  isValidUrl,
  isXiaoHongShuUrl,
  truncateText,
  getByteLength,
  vibrate,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  confirm
};
