#!/bin/bash

# AI文书宝 - 豆包API实际测试脚本
# 测试API是否能够正确生成小红书文案

echo "╔══════════════════════════════════════════════════════════╗"
echo "║       🔥 豆包API实际测试脚本 v1.0                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

API_KEY="4Uu259odAbTbV+oBuC3STcR0X9xvzgQHcYf7tqFQLLc="
MODEL="doubao-1.5-pro-32k-250115"
API_URL="https://ark.cn-beijing.volces.com/api/v3/chat/completions"

# 测试1：简单连接测试
echo -e "\033[1;33m[测试1]\033[0m API连通性测试..."
response=$(curl -s -o /tmp/api_response.json -w "%{http_code}" \
    --connect-timeout 10 \
    "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d "{\"model\":\"$MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}],\"max_tokens\":10}" 2>/dev/null)

if [ "$response" = "200" ]; then
    echo "✅ API服务正常"
else
    echo "❌ API响应异常 (HTTP $response)"
    cat /tmp/api_response.json 2>/dev/null
fi

# 测试2：生成简单文案
echo -e "\n\033[1;33m[测试2]\033[0m 生成测试文案..."

test_prompt='请为以下主题生成小红书文案（只返回JSON）:
主题：分享一款好用的APP
风格：种草推荐

请严格按照JSON格式返回：
{
  "titles": ["标题1", "标题2", "标题3"],
  "content": "正文内容",
  "tags": ["#话题1", "#话题2", "#话题3"]
}'

response=$(curl -s --connect-timeout 15 \
    "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d "{\"model\":\"$MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"$test_prompt\"}],\"temperature\":0.8,\"max_tokens\":1000}" 2>/dev/null)

echo "API响应:"
echo "$response" | head -20

# 解析响应
if echo "$response" | grep -q "choices"; then
    echo -e "\n✅ 生成成功！"
    
    # 提取内容
    content=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('choices',[{}])[0].get('message',{}).get('content','')[:500])" 2>/dev/null)
    echo -e "\n生成内容预览:"
    echo "$content"
else
    echo -e "\n❌ 生成失败"
fi

# 测试3：JSON格式验证
echo -e "\n\033[1;33m[测试3]\033[0m JSON格式验证..."

json_test='{
  "titles": ["测试标题1", "测试标题2"],
  "content": "这是一段测试正文内容",
  "tags": ["#测试", "#标签"]
}'

if echo "$json_test" | python3 -c "import sys,json; json.load(sys.stdin); print('OK')" 2>/dev/null; then
    echo "✅ JSON格式正确"
else
    echo "❌ JSON格式错误"
fi

# 测试4：敏感词检测
echo -e "\n\033[1;33m[测试4]\033[0m 敏感词检测测试..."

sensitive_words=("最" "第一" "国家级" "顶级" "绝对")
test_text="这是一个最好的产品，绝对不能错过！"

found=0
for word in "${sensitive_words[@]}"; do
    if [[ "$test_text" == *"$word"* ]]; then
        echo "检测到敏感词: $word"
        found=$((found+1))
    fi
done

if [ $found -eq 0 ]; then
    echo "✅ 未检测到敏感词"
else
    echo "⚠️ 检测到 $found 个敏感词"
fi

echo -e "\n╔══════════════════════════════════════════════════════════╗"
echo "║                  测试完成                               ║"
echo "╚══════════════════════════════════════════════════════════╝"
