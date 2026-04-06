# Cloudflare Pages 环境变量配置指南

## 📋 需要配置的环境变量

请在 Cloudflare Pages Dashboard 中配置以下环境变量：

### 1. Stepfun 阶跃星辰

```
STEP_API_KEY=3tNxKVwwrcpN4D5RpVfhCcJK2j7uoFRRUvVbfTfSVGbF1KTtJ3vrrqmGDWFxdhGA8
```

### 2. Minimax

```
MINIMAX_API_KEY=sk-cp-LVh-ZtQMz8jnnQ8Xb6u_lnG3WSevC99r7JZTBz0efZKR3YP8xNvpY1oN3KCBfZVB64D0VeHGqjsjbEUaJaPhsIs5C1CmAQZOoCz7fDXqInpAO3_T8HGJ_d0
```

### 3. Volcengine Ark Code

```
ARK_API_KEY=78efeea3-0db1-45e5-9bd6-be3f5825d65c
```

## 🚀 配置步骤

### 步骤 1：登录 Cloudflare Dashboard

访问：https://dash.cloudflare.com/

### 步骤 2：找到 model-orchestration 项目

1. 点击左侧菜单的 **Workers & Pages**
2. 找到 **model-orchestration** 项目
3. 点击项目名称

### 步骤 3：配置环境变量

1. 点击 **Settings** 标签
2. 点击 **Environment variables** 子标签
3. 点击 **Add variable** 按钮
4. 依次添加以下变量：

#### 变量 1：STEP_API_KEY
- **Variable name**: `STEP_API_KEY`
- **Value**: `3tNxKVwwrcpN4D5RpVfhCcJK2j7uoFRRUvVbfTfSVGbF1KTtJ3vrrqmGDWFxdhGA8`
- **Environment**: 选择 **Production** 和 **Preview**
- 点击 **Save**

#### 变量 2：MINIMAX_API_KEY
- **Variable name**: `MINIMAX_API_KEY_KEY`
- **Value**: `sk-cp-LVh-ZtQMz8jnnQ8Xb6u_lnG3WSevC99r7JZTBz0efZKR3YP8xNvpY1oN3KCBfZVB64D0VeHGqjsjbEUaJaPhsIs5C1CmAQZOoCz7fDXqInpAO3_T8HGJ_d0`
- **Environment**: 选择 **Production** 和 **Preview**
- 点击 **Save**

#### 变量 3：ARK_API_KEY
- **Variable name**: `ARK_API_KEY`
- **Value**: `78efeea3-0db1-45e5-9bd6-be3f5825d65c`
- **Environment**: 选择 **Production** 和 **Preview**
- 点击 **Save**

### 步骤 4：重新部署

1. 点击 **Deployments** 标签
2. 点击右上角的 **Retry deployment** 按钮
3. 等待部署完成（通常需要 2-3 分钟）

## ✅ 验证配置

### 方法 1：通过 Portal 测试

1. 访问：https://model-orchestration.pages.dev/
2. 查看 "可用模型状态" 区域
3. 如果显示模型可用，说明配置成功

### 方法 2：通过 API 测试

```bash
# 测试获取模型列表
curl https://model-orchestration.pages.dev/api/models

# 测试健康检查
curl https://model-orchestration.pages.dev/api/health

# 测试任务编排
curl -X POST https://model-orchestration.pages.dev/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "task": "解释一下什么是 RESTful API",
    "strategy": "balanced"
  }'
```

## 🎯 配置完成后的功能

### 可用模型

1. **kimi-pro** (月之暗面)
   - 128K 上下文
   - 函数调用支持
   - 视觉能力支持
   - 成本: $0.012/1K tokens

2. **minimax-abab6.5s-chat** (MiniMax)
   - 32K 上下文
   - 函数调用支持
   - 成本: $0.01/1K tokens

3. **volcengine-plan/ark-code-latest** (火山引擎)
   - 128K 上下文
   - 函数调用支持
   - 视觉能力支持
   - 成本: $0.004/1K tokens

### Portal 功能

- ✅ 查看模型状态
- ✅ 发送简单任务
- ✅ 发送复杂任务（自定义 DAG）
- ✅ 多模型协同
- ✅ 成本统计
- ✅ DAG 可视化

## 📝 本地开发配置

如果需要在本地运行，编辑 `.env` 文件：

```bash
cd /Users/openclaw-mac/.openclaw/workspace/projects/model-orchestration/code
cp .env.example .env
# 编辑 .env 文件，填入 API Keys
npm run pages:dev
```

## 🔒 安全提示

⚠️ **重要**：
- API Keys 已经在 `.env` 文件中，**不要提交到 Git**
- `.env` 已经在 `.gitignore` 中
- Cloudflare Pages Dashboard 中的环境变量是加密存储的
- 定期轮换 API Keys

## 🐛 故障排查

### 问题 1：模型显示"不可用"

**可能原因**：
- API Keys 未配置或配置错误
- 模型服务暂时不可用

**解决方法**：
- 检查 Cloudflare Pages Dashboard 中的环境变量
- 重新部署
- 查看部署日志

### 问题 2：任务编排失败

**可能原因**：
- API Keys 无效或过期
- 模型服务调用失败

**解决方法**：
- 测试单个模型的 API 调用
- 检查 API Keys 是否有效
- 查看 Cloudflare Pages 日志

### 问题 3：部署失败

**可能原因**：
- `wrangler.toml` 配置错误
- 代码语法错误

**解决方法**：
- 检查本地运行是否正常
- 查看部署日志
- 修复错误后重新提交

---

**配置完成后，Portal 将完全可用！** 🎉
