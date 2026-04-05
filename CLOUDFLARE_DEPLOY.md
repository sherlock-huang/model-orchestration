# Cloudflare Pages 部署指南

## 项目配置

在 Cloudflare Pages 控制台使用以下配置：

- **Production branch**: `main`
- **Framework preset**: `None`
- **Build command**: `npm install`
- **Build output directory**: `/`

## 环境变量设置

在 Cloudflare Pages → Settings → Environment variables 中添加：

### 基础配置（推荐）

至少配置一个模型的 API Key：

| 环境变量 | 说明 | 示例 |
|---------|------|------|
| `KIMI_API_KEY` | 月之暗面 Kimi API Key | `sk-xxxxx` |
| `MINIMAX_API_KEY` | MiniMax API Key | `xxxxx` |
| `ARK_CODE_API_KEY` | 火山方舟 Ark Code API Key | `xxxxx` |

### 可选配置

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `KIMI_MODEL_NAME` | Kimi 模型名称 | `kimi-pro` |
| `MINIMAX_MODEL_NAME` | MiniMax 模型名称 | `minimax-abab6.5s-chat` |
| `ARK_CODE_MODEL_NAME` | Ark Code 模型名称 | `volcengine-plan/ark-code-latest` |
| `KIMI_API_ENDPOINT` | Kimi API 端点 | `https://api.moonshot.cn/v1` |
| `MINIMAX_API_ENDPOINT` | MiniMax API 端点 | `https://api.minimax.chat/v1` |
| `ARK_CODE_API_ENDPOINT` | Ark Code API 端点 | `https://ark.cn-beijing.volces.com/api/v3` |

### 高级配置：JSON 方式

如果需要更灵活的模型配置（例如添加自定义模型），可以使用 `MODELS_CONFIG` JSON 数组：

```json
[
  {
    "name": "kimi-pro",
    "provider": "moonshot",
    "api_key": "your-kimi-api-key-here",
    "api_endpoint": "https://api.moonshot.cn/v1",
    "capabilities": {
      "max_tokens": 128000,
      "cost_per_1k_tokens": { "prompt": 0.012, "completion": 0.012 },
      "supports_functions": true,
      "supports_vision": true
    }
  },
  {
    "name": "custom-model",
    "provider": "custom",
    "api_key": "your-custom-api-key",
    "api_endpoint": "https://your-api-endpoint.com/v1",
    "capabilities": {
      "max_tokens": 8192,
      "cost_per_1k_tokens": { "prompt": 0.001, "completion": 0.002 }
    }
  }
]
```

**注意**：`MODELS_CONFIG` 的优先级高于独立配置，会覆盖同名模型。

## API 端点

部署后，你的 API 端点为：

- `GET https://model-orchestration.pages.dev/api/health` - 健康检查
- `GET https://model-orchestration.pages.dev/api/models` - 列出可用模型
- `POST https://model-orchestration.pages.dev/api/orchestrate` - 主编排接口

## 测试

### 健康检查

```bash
curl https://model-orchestration.pages.dev/api/health
```

### 列出模型

```bash
curl https://model-orchestration.pages.dev/api/models
```

### 执行编排任务

```bash
curl -X POST https://model-orchestration.pages.dev/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "task": "写一份 AI 工具对比报告",
    "strategy": "balanced"
  }'
```

### 使用自定义 DAG

```bash
curl -X POST https://model-orchestration.pages.dev/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "customDAG": {
      "tasks": [
        {
          "id": "1",
          "description": "收集 AI 工具资料",
          "model": "kimi-pro",
          "depends_on": []
        },
        {
          "id": "2",
          "description": "对比分析工具特性",
          "model": "minimax-abab6.5s-chat",
          "depends_on": ["1"]
        },
        {
          "id": "3",
          "description": "生成最终报告",
          "model": "ark-code-latest",
          "depends_on": ["2"]
        }
      ],
      "edges": [
        { "from": "1", "to": "2" },
        { "from": "2", "to": "3" }
      ]
    },
    "strategy": "balanced"
  }'
```

## 本地开发

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 API Keys
nano .env

# 安装依赖
npm install

# 启动本地开发服务器（Express 版本）
npm run dev

# 启动本地 Cloudflare Functions 开发
npm run pages:dev

# 部署到 Cloudflare Pages
npm run pages:deploy
```

## 模型定价

当前支持的模型定价（USD per 1K tokens）：

| 模型 | 输入 | 输出 |
|------|------|------|
| Kimi Pro | $0.012 | $0.012 |
| MiniMax ABAB6.5s | $0.01 | $0.01 |
| Volcengine Ark Code | $0.004 | $0.004 |

## 注意事项

1. **环境变量**: 所有 API key 必须在 Cloudflare Pages 设置中配置，不会从 `.env` 文件读取
2. **Cold Start**: 首次调用可能有冷启动延迟（通常 500ms-2s）
3. **请求超时**: Cloudflare Functions 免费版有 50ms CPU 时间限制，付费版可升级
4. **日志**: 使用 Cloudflare Dashboard → Pages → Functions 查看 Functions 日志
5. **模型灵活性**: 可以随时通过环境变量添加或移除模型，无需修改代码
