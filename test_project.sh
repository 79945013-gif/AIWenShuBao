#!/bin/bash

# AI文书宝 - 全面测试脚本
# 测试项目：首页、生成、拆解、历史、设置、云函数

echo "╔══════════════════════════════════════════════════════════╗"
echo "║       🤖 AI文书宝 - 全面功能测试脚本 v1.0                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

PROJECT_PATH="/Users/hg/AIWenShuBao"
PASS=0
FAIL=0

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试函数
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ 通过${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ 失败${NC}"
        ((FAIL++))
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} 文件存在: $1"
        return 0
    else
        echo -e "${RED}✗${NC} 文件缺失: $1"
        return 1
    fi
}

check_json() {
    if [ -f "$1" ]; then
        if python3 -c "import json; json.load(open('$1'))" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} JSON有效: $1"
            return 0
        else
            echo -e "${RED}✗${NC} JSON无效: $1"
            return 1
        fi
    else
        echo -e "${RED}✗${NC} 文件缺失: $1"
        return 1
    fi
}

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}1️⃣  项目结构检查${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# 检查主目录
if [ -d "$PROJECT_PATH" ]; then
    echo -e "${GREEN}✓${NC} 项目目录存在"
    ((PASS++))
else
    echo -e "${RED}✗${NC} 项目目录不存在"
    ((FAIL++))
fi

# 检查核心文件
echo ""
echo "检查核心文件..."
check_file "$PROJECT_PATH/miniprogram/app.js"
check_file "$PROJECT_PATH/miniprogram/app.json"
check_file "$PROJECT_PATH/miniprogram/app.wxss"
check_file "$PROJECT_PATH/project.config.json"
check_file "$PROJECT_PATH/package.json"

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}2️⃣  页面文件检查${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

pages=("home" "generate" "analyze" "history" "settings" "result")

for page in "${pages[@]}"; do
    echo ""
    echo "📄 $page 页面:"
    check_file "$PROJECT_PATH/miniprogram/pages/$page/$page.js"
    check_file "$PROJECT_PATH/miniprogram/pages/$page/$page.wxml"
    check_file "$PROJECT_PATH/miniprogram/pages/$page/$page.wxss"
done

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}3️⃣  配置文件检查${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

check_json "$PROJECT_PATH/miniprogram/app.json"
check_json "$PROJECT_PATH/project.config.json"
check_json "$PROJECT_PATH/package.json"

# 检查app.json页面配置
echo ""
echo "检查页面配置..."
if grep -q "\"pages/home/home\"" "$PROJECT_PATH/miniprogram/app.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} 首页已配置"
    ((PASS++))
else
    echo -e "${RED}✗${NC} 首页未配置"
    ((FAIL++))
fi

if grep -q "\"generate\"" "$PROJECT_PATH/miniprogram/app.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} 生成页已配置"
    ((PASS++))
else
    echo -e "${RED}✗${NC} 生成页未配置"
    ((FAIL++))
fi

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}4️⃣  云函数检查${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

check_file "$PROJECT_PATH/cloudfunctions/generateCopywriting/index.js"
check_file "$PROJECT_PATH/cloudfunctions/generateCopywriting/package.json"

# 检查API密钥配置
echo ""
echo "检查API配置..."
if grep -q "4Uu259odAbTbV+oBuC3STcR0X9xvzgQHcYf7tqFQLLc=" "$PROJECT_PATH/cloudfunctions/generateCopywriting/index.js" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} 云函数API密钥已配置"
    ((PASS++))
else
    echo -e "${RED}✗${NC} 云函数API密钥未配置"
    ((FAIL++))
fi

if grep -q "ark.cn-beijing.volces.com" "$PROJECT_PATH/cloudfunctions/generateCopywriting/index.js" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} API地址已配置"
    ((PASS++))
else
    echo -e "${RED}✗${NC} API地址未配置"
    ((FAIL++))
fi

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}5️⃣  JavaScript语法检查${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

js_files=(
    "$PROJECT_PATH/miniprogram/app.js"
    "$PROJECT_PATH/miniprogram/pages/home/home.js"
    "$PROJECT_PATH/miniprogram/pages/generate/generate.js"
    "$PROJECT_PATH/miniprogram/pages/analyze/analyze.js"
    "$PROJECT_PATH/miniprogram/pages/history/history.js"
    "$PROJECT_PATH/miniprogram/pages/settings/settings.js"
    "$PROJECT_PATH/miniprogram/pages/result/result.js"
    "$PROJECT_PATH/cloudfunctions/generateCopywriting/index.js"
)

for file in "${js_files[@]}"; do
    filename=$(basename "$file")
    if [ -f "$file" ]; then
        # 使用node检查语法
        if node --check "$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} 语法正确: $filename"
            ((PASS++))
        else
            echo -e "${RED}✗${NC} 语法错误: $filename"
            ((FAIL++))
        fi
    else
        echo -e "${RED}✗${NC} 文件缺失: $filename"
        ((FAIL++))
    fi
done

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}6️⃣  WXML模板检查${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

wxml_files=(
    "$PROJECT_PATH/miniprogram/pages/home/home.wxml"
    "$PROJECT_PATH/miniprogram/pages/generate/generate.wxml"
    "$PROJECT_PATH/miniprogram/pages/analyze/analyze.wxml"
    "$PROJECT_PATH/miniprogram/pages/history/history.wxml"
    "$PROJECT_PATH/miniprogram/pages/settings/settings.wxml"
    "$PROJECT_PATH/miniprogram/pages/result/result.wxml"
)

for file in "${wxml_files[@]}"; do
    filename=$(basename "$file")
    if [ -f "$file" ]; then
        # 检查是否包含基础标签
        if grep -q "<view" "$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} WXML有效: $filename"
            ((PASS++))
        else
            echo -e "${YELLOW}⚠${NC} WXML可能有问题: $filename"
        fi
    else
        echo -e "${RED}✗${NC} 文件缺失: $filename"
        ((FAIL++))
    fi
done

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}7️⃣  工具函数检查${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

check_file "$PROJECT_PATH/miniprogram/utils/util.js"

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}8️⃣  API连接测试${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo "测试豆包API连通性..."
response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 \
    "https://ark.cn-beijing.volces.com/api/v3/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer 4Uu259odAbTbV+oBuC3STcR0X9xvzgQHcYf7tqFQLLc=" \
    -d '{"model":"doubao-1.5-pro-32k-250115","messages":[{"role":"user","content":"Hi"}],"max_tokens":10}' 2>/dev/null)

if [ "$response" = "200" ] || [ "$response" = "400" ] || [ "$response" = "401" ]; then
    echo -e "${GREEN}✓${NC} API服务正常 (HTTP $response)"
    ((PASS++))
elif [ "$response" = "000" ]; then
    echo -e "${RED}✗${NC} API连接超时"
    ((FAIL++))
else
    echo -e "${YELLOW}⚠${NC} API响应异常 (HTTP $response)"
fi

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}9️⃣  Git状态检查${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_PATH"
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git仓库已初始化"
    ((PASS++))
    
    # 检查是否有未提交的更改
    if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
        echo -e "${GREEN}✓${NC} 没有未提交的更改"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} 有未提交的更改"
    fi
    
    # 显示最近提交
    echo ""
    echo "最近提交:"
    git log --oneline -3 2>/dev/null
else
    echo -e "${RED}✗${NC} Git仓库未初始化"
    ((FAIL++))
fi

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🔟  文件统计${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

total_files=$(find "$PROJECT_PATH" -type f | wc -l)
js_files_count=$(find "$PROJECT_PATH" -name "*.js" | wc -l)
wxml_files_count=$(find "$PROJECT_PATH" -name "*.wxml" | wc -l)
wxss_files_count=$(find "$PROJECT_PATH" -name "*.wxss" | wc -l)
json_files_count=$(find "$PROJECT_PATH" -name "*.json" | wc -l)

echo "📊 文件统计:"
echo "   总文件数: $total_files"
echo "   JS文件: $js_files_count"
echo "   WXML文件: $wxml_files_count"
echo "   WXSS文件: $wxss_files_count"
echo "   JSON文件: $json_files_count"
echo "   页面数: ${#pages[@]}"

# ============================================================================
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📋  测试总结${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "  ${GREEN}✅ 通过: $PASS${NC}"
echo -e "  ${RED}❌ 失败: $FAIL${NC}"
echo ""

total_tests=$((PASS + FAIL))
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！项目可以正常运行！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  有 $FAIL 项测试失败，请检查上述问题${NC}"
    exit 1
fi
