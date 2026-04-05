// Model Registry - Manage and execute model calls (Cloud flexible version)

import { ModelRegistration, ModelCapabilities, ModelConfig } from './types';
import { MODEL_PRICING, parseModelsFromEnv } from './model-config';

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
   * Initialize models from environment variables
   * @throws Error if no models are configured
   */
  static fromEnv(env?: Record<string, string>): ModelRegistry {
    const registry = new ModelRegistry();
    const configs = parseModelsFromEnv(env);

    if (configs.length === 0) {
      throw new Error(
        'No models configured. Please configure at least one model:\n' +
          '  - KIMI_API_KEY for Kimi\n' +
          '  - MINIMAX_API_KEY for MiniMax\n' +
          '  - ARK_CODE_API_KEY for Volcengine Ark Code\n' +
          '  - MODELS_CONFIG (JSON) for custom models'
      );
    }

    configs.forEach(config => {
      registry.register({
        name: config.name,
        provider: config.provider as any,
        api_key: config.api_key,
        api_endpoint: config.api_endpoint,
        capabilities: config.capabilities,
      });
    });

    console.log(`📦 Initialized ${configs.length} models from environment`);
    return registry;
  }

  /**
   * Register a new model
   */
  register(config: ModelRegistration): void {
    this.models.set(config.name, config);
    console.log(`✅ Model registered: ${config.name} (${config.provider})`);
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
    const result = await this.simulateModelCall(modelName, prompt, systemPrompt, model);

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
    systemPrompt?: string,
    model?: ModelRegistration
  ): Promise<Omit<ModelResult, 'cost'>> {
    console.log(`🤖 Calling ${modelName}...`);
    console.log(`   Provider: ${model?.provider || 'unknown'}`);
    console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simulate token usage (rough estimate: 1 token ≈ 4 chars)
    const inputTokens = Math.ceil((systemPrompt?.length || 0 + prompt.length) / 4);
    const outputTokens = Math.ceil((prompt.length * 2) / 4);

    // Provider-specific mock responses
    const providerResponses: Record<string, string> = {
      'moonshot': `[Kimi Response] Analyzed: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from Kimi (Moonshot). Kimi excels at understanding Chinese context and long documents.`,
      'minimax': `[Minimax ABAB6.5s Response] Processed: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from Minimax ABAB6.5s. It's optimized for Chinese dialogue and multi-turn conversations.`,
      'volcengine': `[Ark Code Response] Generated: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from Volcengine Ark Code. It's ByteDance's powerful coding assistant model.`,
      'openai': `[OpenAI Response] Analyzed: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from OpenAI model.`,
      'anthropic': `[Anthropic Response] Thought about: "${prompt.substring(0, 50)}..." \n\nThis is a simulated response from Anthropic model.`,
    };

    // Try to find response by provider, fallback to model name
    const text =
      providerResponses[model?.provider || ''] ||
      `[${modelName} Response] Mock response for model: ${modelName}`;

    console.log(`   ✅ Completed in ~${Math.random() * 1 + 0.5}s`);

    return {
      text,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
    };
  }
}

/**
 * Global model registry instance (will be initialized from env)
 */
export const globalModelRegistry = new ModelRegistry();

/**
 * Initialize global model registry from environment
 */
export function initializeModels(env?: Record<string, string>): void {
  const registry = ModelRegistry.fromEnv(env);

  // Copy models to global registry
  registry.list().forEach(model => {
    globalModelRegistry.register(model);
  });
}
