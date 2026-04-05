# Model Orchestration Platform

> 大模型聚合转发平台 - 根据任务自动分发模型，支持任务拆解和结果聚合

## 项目代号

项目代号：MOP（Model Orchestration Platform）

## 核心功能

- ✅ **任务自动拆解**：用强模型分析任务，生成 DAG
- ✅ **智能模型路由**：根据任务特征自动选择最佳模型
- ✅ **并行调度**：并行执行无依赖的子任务
- ✅ **结果聚合**：整合多模型输出，生成最终答案
- ✅ **成本优化**：自动追踪成本，提供优化建议

## 技术栈

- **语言**：TypeScript + Node.js
- **HTTP 服务**：Express
- **模型 API**：OpenAI SDK（统一接口）
- **开发工具**：tsx（开发时运行）、TypeScript（类型检查）、Vitest（测试）

## 快速开始

### 本地开发（Express 版本）

```bash
# 安装依赖
npm install

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
```

## 相关文档

- 项目立项书：`../PROJECT.md`
- 竞品分析：`../research/竞品分析.md`
- 技术设计：`../design/技术设计.md`

## 开发进度（MVP 阶段）

- [x] 项目初始化
- [x] 模型注册表（ModelRegistry）
- [x] 任务调度器（TaskScheduler - 串行版本）
- [x] HTTP API (/api/orchestrate, /api/models, /health)
- [x] 成本追踪（Token 计数 + 成本计算）
- [x] 循环依赖检测（拓扑排序）
- [ ] 任务分析器（自动生成 DAG）
- [ ] 结果聚合器（多模型输出整合）
- [ ] 单元测试
- [ ] 部署到生产环境

## 当前实现状态（v0.1.0）

### 已实现
- ✅ 4 个模型注册（GPT-4, GPT-4o, Claude 3.5 Sonnet, DeepSeek Chat）
- ✅ 任务调度器（串行执行 + 拓扑排序）
- ✅ 成本追踪（Token 计数 + 成本计算）
- ✅ 循环依赖检测
- ✅ 健康检查、模型列表 API

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
