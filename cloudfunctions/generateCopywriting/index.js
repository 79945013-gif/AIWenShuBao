// 云函数：generateCopywriting - AI文案生成
// 集成豆包API，支持小红书爆款文案生成

const cloud = require('wx-server-sdk');

cloud.init({ 
  env: cloud.DYNAMIC_CURRENT_ENV 
});

// 豆包API配置
const DOUBAO_CONFIG = {
  apiKey: 'c88cf079-9f2d-43cb-94b4-eb8d415bd8e3',
  model: 'doubao-1.5-pro-32k-250115',
  apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
};

// 小红书敏感词库
const SENSITIVE_WORDS = [
  '最', '第一', '国家级', '顶级', '极品', '极佳', '绝佳',
  '绝对', '终极', '至佳', '完美', '永久', '终身',
  '100%', '百分之百', '保证', '承诺', '保障', '无效退款',
  '特效', '神药', '万能', '包治', '根治', '立竿见影'
];

/**
 * 生成小红书爆款文案
 * @param {string} topic - 主题
 * @param {string} style - 风格
 * @returns {Object} 生成结果
 */
async function generateCopywriting(topic, style) {
  const prompt = buildPrompt(topic, style);
  
  try {
    const response = await wx.cloud.callContainer({
      config: { env: 'xxxx' },
      containerUri: DOUBAO_CONFIG.apiUrl,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
      },
      method: 'POST',
      data: {
        model: DOUBAO_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      }
    });

    if (response.choices && response.choices[0]) {
      const content = response.choices[0].message.content;
      return parseContent(content);
    }
    
    throw new Error('API响应异常');
  } catch (err) {
    console.error('豆包API调用失败:', err);
    // 返回模拟数据
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
请严格按照以下JSON格式返回（不要有任何额外内容）：
{
  "titles": [
    "标题1（带emoji，不超过25字，悬念感强）",
    "标题2（带emoji，不超过25字）",
    "标题3（带emoji，不超过25字）"
  ],
  "content": "正文内容（600-900字，要有emoji，有代入感，像真实博主写的，包含开头钩子、正文、结尾引导）",
  "tags": ["#话题1", "#话题2", "#话题3", "#话题4", "#话题5", "#话题6"],
  "cover_text": "封面文字（5-10字，吸引眼球）"
}

## 注意事项
1. 标题要有悬念感，使用数字或疑问句
2. 正文要生动有趣，有代入感
3. 多用emoji增加可读性
4. 话题标签要精准且有热度
5. 避免使用绝对化词汇`;
}

/**
 * 解析API返回的内容
 */
function parseContent(content) {
  try {
    // 尝试提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      // 验证必要字段
      if (result.titles && result.content && result.tags) {
        // 检查敏感词
        result.sensitiveCheck = checkSensitiveWords(result.content);
        return result;
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
 * 获取模拟数据
 */
function getMockData(topic, style) {
  const mockTitles = [
    `✨${topic || '分享'}，真的太绝了！`,
    `💫${topic || '这个好东西'}，忍不住要分享！`,
    `🌸${topic || '日常分享'}，建议收藏！`
  ];
  
  const mockContent = `🎀 嗨，小仙女们好呀～

最近我发现了一个超级棒的事情，忍不住要和大家分享！

✨ 关于${topic || '这个话题'}，真的太好用了！用了之后感觉生活质量都提升了！

📝 使用心得：
1. 第一步特别重要，一定要记住
2. 中间过程其实没那么复杂
3. 最后的效果真的太惊喜了！

💡 总结：
- 性价比超高
- 使用方便
- 效果明显

💕 整体来说，这个体验真的太棒了！推荐给所有小仙女们！

你们有没有类似的经历呀？评论区告诉我吧～

#${topic || '日常分享'} #种草 #好物推荐 #分享 #生活`;

  const mockTags = ['#日常分享', '#种草', '#好物推荐', '#生活', '#分享', '#小技巧'];

  return {
    titles: mockTitles,
    content: mockContent,
    tags: mockTags,
    cover_text: topic || '今日分享',
    isMock: true
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
      error: err.message
    };
  }
};
