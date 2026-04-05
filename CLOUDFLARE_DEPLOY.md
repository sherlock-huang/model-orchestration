# Cloudflare Pages 部署指南

## 项目配置

在 Cloudflare Pages 控制台使用以下配置：

- **Production branch**: `main`
- **Framework preset**: `None`
- **Build command**: `npm install`
- **Build output directory**: `/`

## 环境变量设置

在 Cloudflare Pages 设置中添加以下环境变量：

- `OPENAI_API_KEY`: 你的 OpenAI API key
- `ANTHROPIC_API_KEY`: 你的 Anthropic API key
- `DEEPSEEK_API_KEY`: 你的 DeepSeek API key

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

## 本地开发

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run pages:dev

# 部署到 Cloudflare Pages
npm run pages:deploy
```

## 注意事项

1. **环境变量**: 所有 API key 必须在 Cloudflare Pages 设置中配置，不会从 `.env` 文件读取
2. **Cold Start**: 首次调用可能有冷启动延迟（通常 500ms-2s）
3. **请求超时**: Cloudflare Functions 免费版有 50ms CPU 时间限制，付费版可升级
4. **日志**: 使用 Cloudflare Dashboard 查看 Functions 日志
