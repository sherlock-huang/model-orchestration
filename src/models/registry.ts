// Model Registry - Manage and execute model calls

import { ModelRegistration, ModelCapabilities } from '../types';

/**
 * Model pricing configuration (USD per 1K tokens)
 */
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'deepseek-chat': { input: 0.0001, output: 0.0002 },
  'qwen-turbo': { input: 0.0004, output: 0.0004 },
};

/**
 * Calculate cost for a model call
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`Unknown model pricing: ${model}, using default: $0.01/1K tokens`);
    return ((inputTokens + outputTokens) / 1000) * 0.01;
  }

  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * Model execution result
 */
export interface ModelResult {
  text: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost: number;
}

/**
 * Model registry class
 */
export class ModelRegistry {
  private models: Map<string, ModelRegistration> = new Map();

  /**
   * Register a new model
   */
  register(config: ModelRegistration): void {
    this.models.set(config.name, config);
    console.log(`✅ Model registered: ${config.name}`);
  }

  /**
   * Get a model by name
   */
  get(name: string): ModelRegistration | undefined {
    return this.models.get(name);
  }

  /**
   * List all registered models
   */
  list(): ModelRegistration[] {
    return Array.from(this.models.values());
  }

  /**
   * Remove a model
   */
  remove(name: string): void {
    this.models.delete(name);
    console.log(`❌ Model removed: ${name}`);
  }

  /**
   * Call a model (synchronous for MVP)
   */
  async call(
    modelName: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<ModelResult> {
    const model = this.get(modelName);
    if (!model) {
      throw new Error(`Model not found: ${modelName}`);
    }

    // MVP: Simulate model call (replace with real API calls later)
    const result = await this.simulateModelCall(modelName, prompt, systemPrompt);

    // Calculate cost
    const cost = calculateCost(modelName, result.input_tokens, result.output_tokens);

    return {
      ...result,
      cost,
    };
  }

  /**
   * Simulate model call (MVP: mock implementation)
   */
  private async simulateModelCall(
    modelName: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<Omit<ModelResult, 'cost'>> {
    console.log(`🤖 Calling ${modelName}...`);
    console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simulate token usage (rough estimate: 1 token ≈ 4 chars)
    const inputTokens = Math.ceil((systemPrompt?.length || 0 + prompt.length) / 4);
    const outputTokens = Math.ceil((prompt.length * 2) / 4); // Mock: output is ~2x input

    // Simulate response based on model
    const mockResponses: Record<string, string> = {
      'gpt-4': `[GPT-4 Response] Analyzed: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from GPT-4. In the full implementation, this would call the OpenAI API.`,
      'gpt-4o': `[GPT-4o Response] Processed: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from GPT-4o. It would be faster and cheaper than GPT-4.`,
      'gpt-3.5-turbo': `[GPT-3.5 Turbo Response] Handled: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from GPT-3.5 Turbo. It's the most cost-effective model.`,
      'claude-3.5-sonnet': `[Claude 3.5 Sonnet Response] Thought about: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from Claude 3.5 Sonnet. Claude excels at nuanced language tasks.`,
      'claude-3-haiku': `[Claude 3 Haiku Response] Quick response to: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from Claude 3 Haiku. It's fast and cost-effective.`,
      'deepseek-chat': `[DeepSeek Chat Response] Computed: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from DeepSeek Chat. It's an extremely cost-effective Chinese model.`,
      'qwen-turbo': `[Qwen Turbo Response] Generated: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from Qwen Turbo. It's Alibaba's efficient Chinese model.`,
    };

    const text = mockResponses[modelName] || `[${modelName} Response] Mock response`;

    console.log(`   ✅ Completed in ~${Math.random() * 1 + 0.5}s`);

    return {
      text,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
    };
  }
}

// Global model registry instance
export const globalModelRegistry = new ModelRegistry();

// Register default models (for MVP testing)
globalModelRegistry.register({
  name: 'gpt-4',
  provider: 'openai',
  api_key: process.env.OPENAI_API_KEY || 'mock-key',
  capabilities: {
    max_tokens: 8192,
    cost_per_1k_tokens: { prompt: 0.03, completion: 0.06 },
    supports_functions: true,
    supports_vision: true,
  },
});

globalModelRegistry.register({
  name: 'gpt-4o',
  provider: 'openai',
  api_key: process.env.OPENAI_API_KEY || 'mock-key',
  capabilities: {
    max_tokens: 128000,
    cost_per_1k_tokens: { prompt: 0.005, completion: 0.015 },
    supports_functions: true,
    supports_vision: true,
  },
});

globalModelRegistry.register({
  name: 'claude-3.5-sonnet',
  provider: 'anthropic',
  api_key: process.env.ANTHROPIC_API_KEY || 'mock-key',
  capabilities: {
    max_tokens: 200000,
    cost_per_1k_tokens: { prompt: 0.003, completion: 0.015 },
    supports_functions: true,
  },
});

globalModelRegistry.register({
  name: 'deepseek-chat',
  provider: 'custom',
  api_key: process.env.DEEPSEEK_API_KEY || 'mock-key',
  capabilities: {
    max_tokens: 4096,
    cost_per_1k_tokens: { prompt: 0.0001, completion: 0.0002 },
  },
});

console.log('📦 Default models registered');
