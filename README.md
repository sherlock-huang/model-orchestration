# Model Orchestration Platform

> 大模型聚合转发平台 - 根据任务自动分发模型，支持任务拆解和结果聚合

<!-- Last updated: 2026-04-05 -->

## 项目代号

项目代号：MOP（Model Orchestration Platform）

## 核心功能

- ✅ **任务自动拆解**：用强模型分析任务，生成 DAG
- ✅ **智能模型路由**：根据任务特征自动选择最佳模型
- ✅ **并行调度**：并行执行无依赖的子任务
- ✅ **结果聚合**：整合多模型输出，生成最终答案
- ✅ **成本优化**：自动追踪成本，提供优化建议
- ✅ **灵活模型配置**：支持通过环境变量动态配置模型

## 技术栈

- **语言**：TypeScript + Node.js
- **HTTP 服务**：Express（本地开发）+ Cloudflare Pages Functions（生产）
- **模型 API**：统一接口，支持多厂商
- **开发工具**：tsx（开发时运行）、TypeScript（类型检查）、Vitest（测试）

## 支持的模型

### 主要模型

| 模型 | 厂商 | 用途 |
|------|------|------|
| Kimi Pro | 月之暗面 | 长文档理解、中文语境 |
| MiniMax ABAB6.5s | MiniMax | 中文对话、多轮交互 |
| Volcengine Ark Code | 火山引擎 | 代码生成、编程助手 |

### 兼容模型

- GPT-4 / GPT-4o（OpenAI）
- Claude 3.5 Sonnet（Anthropic）
- DeepSeek Chat

## 快速开始

### 本地开发（Express 版本）

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 API Keys

# 开发模式
npm run dev

# 构建
npm run build

# 运行测试
npm test
```

### Cloudflare Pages 部署

```bash
# 本地 Cloudflare Functions 开发
npm run pages:dev

# 部署到 Cloudflare Pages
npm run pages:deploy
```

详细部署指南见：[CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)

## 模型配置

### 方式 1：独立配置（简单）

在 `.env` 文件中配置：

```bash
KIMI_API_KEY=your-kimi-api-key
MINIMAX_API_KEY=your-minimax-api-key
ARK_CODE_API_KEY=your-ark-code-api-key
```

### 方式 2：JSON 配置（灵活）

使用 `MODELS_CONFIG` JSON 数组配置：

```bash
MODELS_CONFIG=[
  {
    "name": "kimi-pro",
    "provider": "moonshot",
    "api_key": "your-key",
    "api_endpoint": "https://api.moonshot.cn/v1",
    "capabilities": {
      "max_tokens": 128000,
      "cost_per_1k_tokens": { "prompt": 0.012, "completion": 0.012 }
    }
  }
]
```

详细配置说明见：[.env.example](./.env.example)

## API 接口

### 编排接口

**POST `/api/orchestrate`**

请求体：
```json
{
  "task": "写一份 AI 工具对比报告，需要收集资料、对比分析、写成 Markdown 格式",
  "strategy": "balanced"
}
```

响应体：
```json
{
  "status": "success",
  "result": "最终结果",
  "dag": { ... },
  "model_breakdown": [ ... ],
  "cost_analysis": { ... },
  "execution_time": 5.2
}
```

详细文档见：`../design/技术设计.md`

## 项目结构

```
src/
├── analyzers/      # 任务分析器
│   └── TaskAnalyzer.ts
├── schedulers/     # 调度引擎
│   └── TaskScheduler.ts
├── aggregators/    # 结果聚合器
│   └── ResultAggregator.ts
├── models/         # 模型封装
│   ├── ModelRegistry.ts
│   ├── OpenAIModel.ts
│   ├── ClaudeModel.ts
│   └── DeepSeekModel.ts
├── utils/          # 工具函数
│   ├── dag.ts
│   └── logger.ts
└── index.ts        # 入口文件

functions/          # Cloudflare Pages Functions
├── _middleware.ts   # 首页
├── _shared/         # 共享代码
│   ├── types.ts
│   ├── model-config.ts
│   ├── registry.ts
│   └── scheduler.ts
└── api/             # API 端点
    ├── health.ts
    ├── models.ts
    └── orchestrate.ts
```

## 相关文档

- 项目立项书：`../PROJECT.md`
- 竞品分析：`../research/竞品分析.md`
- 技术设计：`../design/技术设计.md`

## 开发进度（MVP 阶段）

- [x] 项目初始化
- [x] 模型注册表（支持环境变量配置）
- [x] 任务调度器（串行版本）
- [x] HTTP API (/api/orchestrate, /api/models, /health)
- [x] 成本追踪（Token 计数 + 成本计算）
- [x] 循环依赖检测（拓扑排序）
- [x] Cloudflare Pages Functions 支持
- [x] 灵活模型配置（Kimi / MiniMax / Ark Code）
- [ ] 任务分析器（自动生成 DAG）
- [ ] 结果聚合器（多模型输出整合）
- [ ] 真实模型 API 调用（当前是 Mock）
- [ ] 单元测试
- [ ] 并行调度器

## 当前实现状态（v0.1.0）

### 已实现
- ✅ 灵活模型配置（Kimi / MiniMax / Ark Code）
- ✅ 任务调度器（串行执行 + 拓扑排序）
- ✅ 成本追踪（Token 计数 + 成本计算）
- ✅ 循环依赖检测
- ✅ 健康检查、模型列表 API
- ✅ Cloudflare Pages Functions 支持
- ✅ 环境变量动态配置模型

### 待实现
- ⏳ 真实的模型 API 调用（当前是 Mock 实现）
- ⏳ 任务分析器（自动生成 DAG）
- ⏳ 并行调度器
- ⏳ 结果聚合器
- ⏳ 单元测试

## 贡献指南

欢迎贡献！请先阅读 `../PROJECT.md` 了解项目规划。

## 许可证

MIT
