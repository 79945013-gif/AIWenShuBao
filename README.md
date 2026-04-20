# AI文书宝

> 小红书爆款文案一键生成微信小程序

## 📖 项目介绍

AI文书宝是一款专注于小红书内容创作的AI工具，支持一键生成爆款标题、正文、话题标签，并提供封面设计和爆款拆解功能。

## ✨ 核心功能

### 1. AI文案生成
- 输入主题关键词
- 选择风格（日常分享、干货教程、种草推荐、情感共鸣、搞笑幽默、探店打卡）
- 一键生成3个爆款标题 + 正文 + 话题标签
- 内置合规检测，自动识别违规词

### 2. AI封面生成
- 多种封面风格可选（简约风、高级感、可爱风、时尚感）
- 智能生成精美封面文字
- 长按保存到相册

### 3. 爆款拆解
- 输入小红书笔记链接
- AI智能分析标题、内容、话题、封面
- 提供详细优化建议

### 4. 合规检测
- 自动检测文案中的敏感词
- 风险等级提示（低/中/高）
- 保障内容安全发布

## 🎯 功能特色

- **操作简单**：输入关键词，一键生成
- **风格多样**：6种内容风格可选
- **合规保障**：内置敏感词检测
- **历史记录**：生成内容自动保存
- **会员权益**：Pro会员无限使用

## 📱 界面预览

```
┌─────────────────────────────┐
│  🎙️ AI文书宝               │
│  小红书爆款文案 · 一键生成   │
│                             │
│  ┌───────┐ ┌───────┐       │
│  │ AI文案 │ │ AI封面 │       │
│  │  生成  │ │  生成  │       │
│  └───────┘ └───────┘       │
│                             │
│  [🚀 立即开始生成]          │
│                             │
│  今天剩余: 10 次免费机会      │
└─────────────────────────────┘
```

## 🛠️ 技术栈

- **前端框架**：微信小程序原生开发
- **AI能力**：豆包大模型 API
- **云开发**：微信云开发
- **样式**：WXSS

## 📂 项目结构

```
AIWenShuBao/
├── miniprogram/           # 小程序主目录
│   ├── pages/            # 页面
│   │   ├── home/         # 首页
│   │   ├── generate/     # 生成页
│   │   ├── analyze/      # 拆解页
│   │   ├── history/      # 历史页
│   │   ├── settings/     # 设置页
│   │   └── result/       # 结果页
│   ├── utils/            # 工具函数
│   ├── assets/           # 静态资源
│   ├── app.js            # 应用入口
│   └── app.json          # 应用配置
├── cloudfunctions/       # 云函数
│   └── generateCopywriting/  # 文案生成云函数
├── project.config.json   # 项目配置
└── package.json          # 依赖配置
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/79945013-gif/AIWenShuBao.git
cd AIWenShuBao
```

### 2. 打开项目
1. 下载并打开 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目，选择 `AIWenShuBao` 文件夹
3. 填写小程序 AppID（或使用测试号）

### 3. 配置云开发
1. 开通微信云开发
2. 创建云环境
3. 上传云函数 `generateCopywriting`

### 4. 配置API
在 `miniprogram/app.js` 中配置豆包API Key：
```javascript
doubao: {
  apiKey: 'your-api-key',
  model: 'doubao-1.5-pro-32k-250115'
}
```

### 5. 运行
点击微信开发者工具的「编译」按钮，即可预览效果。

## 📝 使用指南

### AI文案生成
1. 首页点击「AI文案」或「全套生成」
2. 输入内容主题（越详细越好）
3. 选择合适的风格
4. 点击「AI一键生成」
5. 复制文案或保存到历史

### 爆款拆解
1. 切换到「拆解」标签
2. 粘贴小红书笔记链接
3. 点击「开始分析」
4. 查看详细分析报告
5. 根据建议优化内容

## 🔧 API配置

### 豆包API申请
1. 访问 [火山引擎](https://www.volcengine.com/)
2. 注册并开通方舟推理服务
3. 创建API Key
4. 替换代码中的 `apiKey`

### 云函数部署
```bash
# 进入云函数目录
cd cloudfunctions/generateCopywriting

# 安装依赖
npm install

# 部署云函数（通过微信开发者工具）
```

## 🎨 自定义配置

### 修改每日免费次数
在 `app.js` 中修改：
```javascript
freeLimit: 10  // 改为想要的次数
```

### 添加敏感词
在 `cloudfunctions/generateCopywriting/index.js` 的 `SENSITIVE_WORDS` 数组中添加。

### 自定义风格
在 `generate.js` 的 `styleOptions` 数组中添加新风格。

## 📄 License

MIT License - 欢迎 Star 和 Fork！

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系我们

- 邮箱：support@aiwenshubao.com
- 官网：待更新

---

**让创作更简单，用AI文书宝！** ✨
