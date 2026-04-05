// Model configuration - Flexible model registry
// 可以通过环境变量动态配置模型

export interface ModelConfig {
  name: string;
  provider: string;
  api_key: string;
  api_endpoint?: string;
  capabilities: {
    max_tokens: number;
    cost_per_1k_tokens: {
      prompt: number;
      completion: number;
    };
    supports_functions?: boolean;
    supports_vision?: boolean;
  };
}

/**
 * 模型定价配置（USD per 1K tokens）
 */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Moonshot Kimi
  'kimi-pro': { input: 0.012, output: 0.012 },
  'kimi-latest': { input: 0.012, output: 0.012 },
  'kimi-plus': { input: 0.008, output: 0.008 },

  // Minimax
  'minimax-abab6.5s-chat': { input: 0.01, output: 0.01 },
  'minimax-abab6.5g-chat': { input: 0.008, output: 0.008 },

  // Volcengine Ark Code
  'volcengine-plan/ark-code-latest': { input: 0.004, output: 0.004 },
  'ark-code-latest': { input: 0.004, output: 0.004 },

  // OpenAI (保留兼容)
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },

  // Anthropic Claude (保留兼容)
  'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },

  // DeepSeek (保留兼容)
  'deepseek-chat': { input: 0.0001, output: 0.0002 },
  'qwen-turbo': { input: 0.0004, output: 0.0004 },
};

/**
 * 从环境变量解析模型配置
 *
 * 支持两种配置方式，可以单独使用或同时使用：
 * 1. 独立配置：KIMI_API_KEY, MINIMAX_API_KEY, ARK_CODE_API_KEY（简单方式）
 * 2. JSON 配置：MODELS_CONFIG（JSON 数组，覆盖同名模型）
 *
 * 优先级：JSON 配置 > 独立配置
 */
export function parseModelsFromEnv(env: Record<string, string> = {}): ModelConfig[] {
  const models: ModelConfig[] = [];

  // 方式 1: 独立配置（简单方式）
  const envVars = getEnvVars();
  const apiKeys = { ...envVars };

  // 从传入的 env 覆盖（用于 Cloudflare Functions）
  if (env.OPENAI_API_KEY) apiKeys.OPENAI_API_KEY = env.OPENAI_API_KEY;
  if (env.ANTHROPIC_API_KEY) apiKeys.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  if (env.DEEPSEEK_API_KEY) apiKeys.DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
  if (env.KIMI_API_KEY) apiKeys.KIMI_API_KEY = env.KIMI_API_KEY;
  if (env.MINIMAX_API_KEY) apiKeys.MINIMAX_API_KEY = env.MINIMAX_API_KEY;
  if (env.ARK_CODE_API_KEY) apiKeys.ARK_CODE_API_KEY = env.ARK_CODE_API_KEY;

  // Kimi (如果配置了 KIMI_API_KEY)
  if (apiKeys.KIMI_API_KEY) {
    models.push({
      name: env.KIMI_MODEL_NAME || 'kimi-pro',
      provider: 'moonshot',
      api_key: apiKeys.KIMI_API_KEY,
      api_endpoint: env.KIMI_API_ENDPOINT || 'https://api.moonshot.cn/v1',
      capabilities: {
        max_tokens: 128000,
        cost_per_1k_tokens: {
          prompt: MODEL_PRICING['kimi-pro'].input,
          completion: MODEL_PRICING['kimi-pro'].output,
        },
        supports_functions: true,
        supports_vision: true,
      },
    });
  }

  // Minimax (如果配置了 MINIMAX_API_KEY)
  if (apiKeys.MINIMAX_API_KEY) {
    models.push({
      name: env.MINIMAX_MODEL_NAME || 'minimax-abab6.5s-chat',
      provider: 'minimax',
      api_key: apiKeys.MINIMAX_API_KEY,
      api_endpoint: env.MINIMAX_API_ENDPOINT || 'https://api.minimax.chat/v1',
      capabilities: {
        max_tokens: 32000,
        cost_per_1k_tokens: {
          prompt: MODEL_PRICING['minimax-abab6.5s-chat'].input,
          completion: MODEL_PRICING['minimax-abab6.5s-chat'].output,
        },
        supports_functions: true,
      },
    });
  }

  // Volcengine Ark Code (如果配置了 ARK_CODE_API_KEY)
  if (apiKeys.ARK_CODE_API_KEY) {
    models.push({
      name: env.ARK_CODE_MODEL_NAME || 'volcengine-plan/ark-code-latest',
      provider: 'volcengine',
      api_key: apiKeys.ARK_CODE_API_KEY,
      api_endpoint: env.ARK_CODE_API_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3',
      capabilities: {
        max_tokens: 128000,
        cost_per_1k_tokens: {
          prompt: MODEL_PRICING['volcengine-plan/ark-code-latest'].input,
          completion: MODEL_PRICING['volcengine-plan/ark-code-latest'].output,
        },
        supports_functions: true,
        supports_vision: true,
      },
    });
  }

  // 方式 2: JSON 配置（可选，优先级更高，覆盖独立配置）
  // 如果配置了 MODELS_CONFIG，会合并到现有模型列表中
  if (env.MODELS_CONFIG) {
    try {
      const customModels = JSON.parse(env.MODELS_CONFIG);
      customModels.forEach((model: any) => {
        // 查找是否已存在同名模型，存在则更新
        const existingIndex = models.findIndex(m => m.name === model.name);
        if (existingIndex >= 0) {
          console.log(`📝 Updating model from MODELS_CONFIG: ${model.name}`);
          models[existingIndex] = {
            ...models[existingIndex],
            ...model,
          };
        } else {
          console.log(`➕ Adding model from MODELS_CONFIG: ${model.name}`);
          models.push(model);
        }
      });
    } catch (e) {
      console.error('Failed to parse MODELS_CONFIG:', e);
    }
  }

  return models;
}

/**
 * 获取环境变量（兼容 Node.js 和 Cloudflare Workers）
 */
function getEnvVars(): Record<string, string> {
  try {
    return {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
      KIMI_API_KEY: process.env.KIMI_API_KEY || '',
      MINIMAX_API_KEY: process.env.MINIMAX_API_KEY || '',
      ARK_CODE_API_KEY: process.env.ARK_CODE_API_KEY || '',
      KIMI_MODEL_NAME: process.env.KIMI_MODEL_NAME || '',
      MINIMAX_MODEL_NAME: process.env.MINIMAX_MODEL_NAME || '',
      ARK_CODE_MODEL_NAME: process.env.ARK_CODE_MODEL_NAME || '',
      KIMI_API_ENDPOINT: process.env.KIMI_API_ENDPOINT || '',
      MINIMAX_API_ENDPOINT: process.env.MINIMAX_API_ENDPOINT || '',
      ARK_CODE_API_ENDPOINT: process.env.ARK_CODE_API_ENDPOINT || '',
    };
  } catch {
    return {};
  }
}
