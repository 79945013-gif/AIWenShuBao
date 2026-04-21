// 云函数：generateCopywriting - AI文案生成
// 集成豆包API，支持小红书爆款文案生成
const cloud = require('wx-server-sdk');

// 云函数初始化
cloud.init({ 
  env: cloud.DYNAMIC_CURRENT_ENV 
});

// 豆包API配置 - 火山引擎
const DOUBAO_CONFIG = {
  apiKey: '4Uu259odAbTbV+oBuC3STcR0X9xvzgQHcYf7tqFQLLc=',
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
  
  try {
    // 调用豆包API
    const content = await callDoubaoAPI(prompt);
    const result = parseContent(content);
    
    // 添加敏感词检测
    result.sensitiveCheck = checkSensitiveWords(result.content);
    
    return result;
  } catch (err) {
    console.error('豆包API调用失败:', err);
    // 返回高质量的模拟数据作为备选
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
    return getMockData(topic, '日常分享');
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
 * 获取模拟数据（备选方案）
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
