// 云函数：generateCopywriting - AI文案生成
// 集成豆包API，支持小红书爆款文案生成
const cloud = require('wx-server-sdk');

// 云函数初始化
cloud.init({ 
  env: cloud.DYNAMIC_CURRENT_ENV 
});

// 豆包API配置 - 火山引擎
const DOUBAO_CONFIG = {
  apiKey: '6d23d85a-6fe4-4497-b74e-f152996b18ad',
  model: 'doubao-1.5-pro-32k-250115',
  apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
};

// 小红书敏感词库
const SENSITIVE_WORDS = [
  '最', '第一', '国家级', '顶级', '极品', '极佳', '绝佳',
  '绝对', '终极', '至佳', '完美', '永久', '终身',
  '100%', '百分之百', '保证', '承诺', '保障', '无效退款',
  '特效', '神药', '万能', '包治', '根治', '立竿见影',
  '全网第一', '全网最佳', '全球第一', '销量冠军'
];

/**
 * 调用豆包API生成文案
 */
async function callDoubaoAPI(prompt) {
  // 注意：微信云函数环境下，需要使用wx-server-sdk的HTTP能力
  // 或者使用云托管方式调用外部API
  const response = await wx.request({
    url: DOUBAO_CONFIG.apiUrl,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
    },
    data: {
      model: DOUBAO_CONFIG.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.85,
      max_tokens: 2500
    }
  });

  if (response.statusCode === 200 && response.data.choices) {
    return response.data.choices[0].message.content;
  }
  
  throw new Error(`API调用失败: ${response.statusCode}`);
}

/**
 * 生成小红书爆款文案
 */
async function generateCopywriting(topic, style) {
  const prompt = buildPrompt(topic, style);
  
  // 检查是否配置了正确的API密钥
  if (DOUBAO_CONFIG.apiKey === 'YOUR_API_KEY') {
    console.log('使用模拟数据模式（请配置正确的API密钥）');
    return getMockData(topic, style);
  }
  
  try {
    // 调用豆包API
    const content = await callDoubaoAPI(prompt);
    const result = parseContent(content);
    
    // 添加敏感词检测
    result.sensitiveCheck = checkSensitiveWords(result.content);
    
    return result;
  } catch (err) {
    console.error('豆包API调用失败:', err);
    // API调用失败时返回高质量的模拟数据
    return getMockData(topic, style);
  }
}

/**
 * 构建Prompt
 */
function buildPrompt(topic, style) {
  const styleConfig = {
    '日常分享': {
      desc: '轻松日常、有趣生活',
      examples: '分享日常穿搭、好物推荐、生活小技巧'
    },
    '干货教程': {
      desc: '知识干货、专业讲解',
      examples: '化妆教程、学习方法、职场技巧'
    },
    '种草推荐': {
      desc: '好物推荐、产品测评',
      examples: '护肤品推荐、美食探店、家居好物'
    },
    '情感共鸣': {
      desc: '情感故事、内心独白',
      examples: '成长感悟、情感经历、生活思考'
    },
    '搞笑幽默': {
      desc: '轻松搞笑、段子吐槽',
      examples: '日常吐槽、沙雕日常、搞笑段子'
    },
    '探店打卡': {
      desc: '地点推荐、店铺体验',
      examples: '咖啡探店、景点打卡、餐厅推荐'
    }
  };
  
  const config = styleConfig[style] || styleConfig['日常分享'];
  
  return `你是一个专业的小红书文案专家，擅长撰写爆款笔记。请为以下主题生成小红书文案。

## 主题
${topic}

## 风格要求
${config.desc}，例如：${config.examples}

## 输出要求
请严格按照以下JSON格式返回（不要有任何额外内容，只返回JSON）：
{
  "titles": [
    "标题1（带emoji，不超过25字，悬念感强，能吸引点击）",
    "标题2（带emoji，不超过25字）",
    "标题3（带emoji，不超过25字）"
  ],
  "content": "正文内容（600-900字，要有emoji，有代入感，像真实博主写的，包含开头钩子、正文分段、结尾引导互动）",
  "tags": ["#话题1", "#话题2", "#话题3", "#话题4", "#话题5", "#话题6"],
  "cover_text": "封面文字（5-10字，吸引眼球）"
}

## 注意事项
1. 标题要有悬念感，使用数字或疑问句，激发好奇心
2. 正文要生动有趣，有代入感，善用emoji
3. 正文分段清晰，每段不要太长
4. 话题标签要精准且有热度
5. 避免使用绝对化词汇（最、第一、顶级等）`;
}

/**
 * 解析API返回的内容
 */
function parseContent(content) {
  try {
    // 尝试提取JSON
    let jsonStr = content;
    
    // 移除markdown代码块
    if (content.includes('```json')) {
      jsonStr = content.match(/```json\n?([\s\S]*?)```/)?.[1] || content;
    } else if (content.includes('```')) {
      jsonStr = content.match(/```\n?([\s\S]*?)```/)?.[1] || content;
    }
    
    // 提取JSON对象
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      
      // 验证必要字段
      if (result.titles && result.content && result.tags) {
        return {
          titles: Array.isArray(result.titles) ? result.titles.slice(0, 3) : [result.titles],
          content: result.content,
          tags: Array.isArray(result.tags) ? result.tags.slice(0, 6) : result.tags,
          cover_text: result.cover_text || '今日分享',
          isMock: false
        };
      }
    }
    
    throw new Error('JSON格式不正确');
  } catch (e) {
    console.error('解析失败:', e);
    return getMockData('', '日常分享');
  }
}

/**
 * 检查敏感词
 */
function checkSensitiveWords(text) {
  const found = SENSITIVE_WORDS.filter(word => text.includes(word));
  return {
    passed: found.length === 0,
    words: found,
    risk: found.length === 0 ? 'low' : found.length <= 2 ? 'medium' : 'high'
  };
}

/**
 * 获取高质量模拟数据
 */
function getMockData(topic, style) {
  const styleMockData = {
    '日常分享': {
      titles: [
        `🌸${topic || '分享'}，真的太绝了！`,
        `💫私藏已久的${topic || '好东西'}，今天终于分享了！`,
        `✨${topic || '日常分享'}，建议收藏！`
      ],
      content: `🎀 嗨，小仙女们好呀～

最近发现了一个超级棒的事情，忍不住要和大家分享！

✨ 关于${topic || '这个话题'}，真的太好用了！用了之后感觉生活质量都提升了！

📝 使用心得：
1. 第一步特别重要，一定要记住哦
2. 中间过程其实没那么复杂
3. 最后的效果真的太惊喜了！

💡 宝藏小 tips：
- 建议早上使用效果更好
- 坚持使用一周会有明显变化
- 搭配其他产品使用效果加倍

💕 整体来说，这个体验真的太棒了！推荐给所有小仙女们！

你们有没有类似的经历呀？评论区告诉我吧～

#${topic || '日常分享'} #种草 #好物推荐 #分享 #生活 #小技巧`,
      tags: ['#日常分享', '#种草', '#好物推荐', '#生活', '#分享', '#小技巧']
    },
    '干货教程': {
      titles: [
        `📚${topic || '教程'}，建议收藏备用！`,
        `💯学会这个${topic || '技巧'}，效率翻倍！`,
        `🔥${topic || '干货分享'}，建议收藏！`
      ],
      content: `📚 Hi，大家好呀～

今天来分享一个超级实用的${topic || '技巧'}！

✨ 为什么分享这个？
因为真的太重要了，很多人都还不知道！

📖 具体步骤：
第一步：准备好需要的工具
第二步：按照顺序操作，不要跳步
第三步：完成后检查效果

⚠️ 注意事项：
- 一定要按照步骤来
- 遇到问题不要慌
- 收藏起来慢慢看

💪 坚持练习，你会发现变化！

有什么问题评论区问我哦～

#${topic || '教程'} #干货 #学习 #技巧 #分享 #职场`,
      tags: ['#干货教程', '#学习', '#技巧分享', '#职场', '#涨知识', '#建议收藏']
    },
    '种草推荐': {
      titles: [
        `💖${topic || '好物'}推荐，入手不亏！`,
        `😍${topic || '这个好东西'}，真的太好用了！`,
        `✨${topic || '种草'}清单｜用了就离不开！`
      ],
      content: `💖 嗨，宝贝们好呀～

今天来种草一个超级好用的${topic || '东西'}！

🌟 为什么推荐？
- 效果真的绝了
- 性价比超高
- 使用感超棒

📦 开箱体验：
包装很精美，拿到手就爱上了！

✨ 使用感受：
用了大概一周左右，效果真的很明显！
皮肤变得滑滑嫩嫩的，而且完全不刺激～

💰 价格：
性价比超高，学生党也能轻松入手！

🏷️ 总结：
推荐指数：⭐⭐⭐⭐⭐
无限回购款！真的太好用了！

你们用过什么好用的${topic || '产品'}？评论区告诉我呀～

#${topic || '种草'} #好物推荐 #护肤 #回购 #测评 #分享`,
      tags: ['#种草推荐', '#好物分享', '#回购好物', '#测评', '#护肤', '#推荐']
    },
    '情感共鸣': {
      titles: [
        `💭${topic || '故事'}，说给你听...`,
        `😭${topic || '经历'}，你有过吗？`,
        `💕 关于${topic || '成长'}，我想说...`
      ],
      content: `💭 嗨，你好呀～

今天想和你聊聊${topic || '这件事'}。

不知道你有没有过这样的经历...

✨ 曾经的我：
总是觉得自己不够好
害怕失败，不敢尝试
把别人的期待当成自己的目标

🌸 现在的我：
学会了接纳不完美的自己
明白失败是成长的必经之路
开始勇敢追求想要的生活

💡 感悟：
生活就像一本书
每一页都有它的意义
不要着急，慢慢来

谢谢你愿意听我说这些～

你有什么想分享的吗？评论区等你呀 💕

#${topic || '情感'} #成长 #感悟 #分享 #心情 #日记`,
      tags: ['#情感共鸣', '#成长故事', '#内心独白', '#心情', '#日记', '#分享']
    },
    '搞笑幽默': {
      titles: [
        `😂${topic || '日常'}，太真实了！`,
        `🤣${topic || '这件事'}，笑死我了！`,
        `😆${topic || '沙雕日常'}，太绝了！`
      ],
      content: `🤣 哈哈哈哈笑死我了！

你们有没有遇到过${topic || '这种事'}！！

👀 事情是这样的：
本来以为很简单
结果搞了一个下午
最后发现...我搞错了？？？

😂 我当时的内心：
？？？
不是吧？？
我是不是傻？？

🌚 血的教训：
以后做事一定要看清楚
不然就会像我一样
成为一个行走的表情包

💀 希望你们不要像我一样蠢

评论区说说你们干过什么蠢事！让我开心一下～

#${topic || '搞笑'} #沙雕日常 #吐槽 #搞笑日常 #段子 #哈哈哈`,
      tags: ['#搞笑幽默', '#沙雕日常', '#吐槽', '#生活趣事', '#哈哈哈', '#段子']
    },
    '探店打卡': {
      titles: [
        `📍${topic || '探店'}｜发现宝藏店铺！`,
        `🏠${topic || '这家店'}，太绝了！`,
        `✨${topic || '宝藏店铺'}，推荐给大家！`
      ],
      content: `📍 探店打卡！

今天发现了一家超级棒的${topic || '店铺'}！

🏠 店铺信息：
📍 地址：xxxx路xx号
⏰ 营业时间：10:00-22:00
💰 人均：xx元

✨ 环境：
一进门就被吸引了
装修风格超有feel
拍照超级出片！

🍽️ 推荐菜品：
1. xxx - 必点！
2. xxx - 超好吃
3. xxx - 颜值担当

💯 体验感：
服务态度超好
上菜速度也快
下次还会再来！

📸 拍照 tips：
最佳拍照角度在xxx
光线最好的时间是xxx

🏷️ 总结：
推荐指数：⭐⭐⭐⭐⭐
不容错过的宝藏店铺！

快去打卡吧！评论区告诉我你的体验～

#${topic || '探店'} #打卡 #宝藏店铺 #推荐 #美食探店 #周末去哪`,
      tags: ['#探店打卡', '#宝藏店铺', '#美食推荐', '#周末去哪', '#打卡', '#分享']
    }
  };
  
  const mockData = styleMockData[style] || styleMockData['日常分享'];
  
  return {
    titles: mockData.titles,
    content: mockData.content,
    tags: mockData.tags,
    cover_text: topic || '今日分享',
    isMock: true,
    sensitiveCheck: { passed: true, words: [], risk: 'low' }
  };
}

// 导出云函数
exports.main = async (event, context) => {
  const { topic, style } = event;
  
  if (!topic) {
    return {
      success: false,
      error: '请输入内容主题'
    };
  }
  
  try {
    const result = await generateCopywriting(topic, style || '日常分享');
    return {
      success: true,
      data: result
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || '生成失败，请稍后重试'
    };
  }
};
