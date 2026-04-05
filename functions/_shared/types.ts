// Core Types for Model Orchestration Platform (Cloudflare Functions compatible)

/**
 * DAG (Directed Acyclic Graph) structure for task orchestration
 */
export interface DAG {
  tasks: Task[];
  edges: Edge[];
}

/**
 * Task definition
 */
export interface Task {
  id: string;
  description: string;
  model: string;
  prompt?: string;
  depends_on?: string[];
  timeout?: number;
  retry?: number;
}

/**
 * Edge definition for task dependencies
 */
export interface Edge {
  from: string;
  to: string;
  condition?: string;
}

/**
 * Orchestration request
 */
export interface OrchestrateRequest {
  task: string;
  strategy?: 'cost' | 'quality' | 'balanced';
  customDAG?: DAG;
  timeout?: number;
}

/**
 * Orchestration response
 */
export interface OrchestrateResponse {
  status: 'success' | 'partial_success' | 'failed';
  result?: string;
  dag?: DAG;
  model_breakdown?: ModelBreakdown[];
  cost_analysis?: CostAnalysis;
  execution_time?: number;
  error?: string;
}

/**
 * Model usage breakdown
 */
export interface ModelBreakdown {
  model: string;
  task_count: number;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost: number;
}

/**
 * Cost analysis
 */
export interface CostAnalysis {
  total_cost: number;
  model_breakdown: Record<string, number>;
  optimization_suggestion?: string;
}

/**
 * Model registration
 */
export interface ModelRegistration {
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'custom' | 'moonshot' | 'minimax' | 'volcengine';
  api_key: string;
  api_endpoint?: string;
  capabilities: ModelCapabilities;
}

/**
 * Model capabilities
 */
export interface ModelCapabilities {
  max_tokens: number;
  cost_per_1k_tokens: {
    prompt: number;
    completion: number;
  };
  supports_functions?: boolean;
  supports_vision?: boolean;
}

/**
 * Strategy type
 */
export type Strategy = 'cost' | 'quality' | 'balanced';

/**
 * Execution log
 */
export interface ExecutionLog {
  id: string;
  task: string;
  dag: DAG;
  results: Record<string, string>;
  cost_analysis: CostAnalysis;
  execution_time: number;
  timestamp: number;
}
