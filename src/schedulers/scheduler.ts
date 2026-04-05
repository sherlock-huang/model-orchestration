// Task Scheduler - Execute tasks according to DAG

import { DAG, Task, ModelBreakdown } from '../types';
import { ModelRegistry, ModelResult } from '../models/registry';

/**
 * Scheduler output
 */
export interface SchedulerOutput {
  results: Record<string, string>;
  model_breakdown: ModelBreakdown[];
  execution_time: number;
}

/**
 * Task scheduler class
 */
export class TaskScheduler {
  constructor(private modelRegistry: ModelRegistry) {}

  /**
   * Schedule and execute tasks
   */
  async schedule(dag: DAG): Promise<SchedulerOutput> {
    const startTime = Date.now();
    const results: Record<string, string> = {};
    const modelBreakdown: Map<string, ModelBreakdown> = new Map();

    console.log('📋 Starting task scheduling...');
    console.log(`   Tasks: ${dag.tasks.length}`);
    console.log(`   Edges: ${dag.edges.length}`);

    // Step 1: Topological sort
    const sortedTasks = this.topologicalSort(dag);
    console.log(`   Topological order: ${sortedTasks.map(t => t.id).join(' -> ')}`);

    // Step 2: Execute tasks (MVP: serial execution)
    for (const task of sortedTasks) {
      console.log(`\n🎯 Executing task ${task.id}: ${task.description.substring(0, 50)}...`);

      try {
        // Execute task
        const result = await this.executeTask(task, results);
        results[task.id] = result.text;

        // Update model breakdown
        this.updateModelBreakdown(modelBreakdown, task, result);

        console.log(`   ✅ Task ${task.id} completed`);
      } catch (error) {
        console.error(`   ❌ Task ${task.id} failed:`, error);
        throw error;
      }
    }

    const executionTime = (Date.now() - startTime) / 1000;

    console.log(`\n✨ All tasks completed in ${executionTime.toFixed(2)}s`);

    return {
      results,
      model_breakdown: Array.from(modelBreakdown.values()),
      execution_time: executionTime,
    };
  }

  /**
   * Execute a single task
   */
  private async executeTask(
    task: Task,
    contextResults: Record<string, string>
  ): Promise<ModelResult> {
    // Build prompt with context from dependencies
    const prompt = this.buildPrompt(task, contextResults);

    // Call model
    const result = await this.modelRegistry.call(task.model, prompt);

    return result;
  }

  /**
   * Build prompt with context from dependencies
   */
  private buildPrompt(
    task: Task,
    contextResults: Record<string, string>
  ): string {
    if (!task.depends_on || task.depends_on.length === 0) {
      return task.prompt || `Please help me with: ${task.description}`;
    }

    let prompt = 'Context from previous tasks:\n\n';

    task.depends_on.forEach(depId => {
      const context = contextResults[depId];
      prompt += `--- Task ${depId} output ---\n${context}\n--- End of task ${depId} ---\n\n`;
    });

    prompt += `Current task: ${task.description}\n`;

    if (task.prompt) {
      prompt += `\nInstructions: ${task.prompt}`;
    }

    return prompt;
  }

  /**
   * Update model breakdown
   */
  private updateModelBreakdown(
    modelBreakdown: Map<string, ModelBreakdown>,
    task: Task,
    result: ModelResult
  ): void {
    const model = task.model;

    if (!modelBreakdown.has(model)) {
      modelBreakdown.set(model, {
        model,
        task_count: 0,
        token_usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
        cost: 0,
      });
    }

    const breakdown = modelBreakdown.get(model)!;
    breakdown.task_count += 1;
    breakdown.token_usage.prompt_tokens += result.input_tokens;
    breakdown.token_usage.completion_tokens += result.output_tokens;
    breakdown.token_usage.total_tokens += result.total_tokens;
    breakdown.cost += result.cost;
  }

  /**
   * Topological sort using Kahn's algorithm
   */
  private topologicalSort(dag: DAG): Task[] {
    const tasks = dag.tasks;
    const edges = dag.edges;
    const inDegree = new Map<string, number>();

    // Initialize in-degree for all tasks
    tasks.forEach(task => inDegree.set(task.id, 0));

    // Calculate in-degree for each task
    edges.forEach(edge => {
      const toDegree = inDegree.get(edge.to) || 0;
      inDegree.set(edge.to, toDegree + 1);
    });

    // Find tasks with in-degree 0 (no dependencies)
    const queue = tasks.filter(task => inDegree.get(task.id) === 0);
    const result: Task[] = [];

    while (queue.length > 0) {
      const task = queue.shift()!;
      result.push(task);

      // Find all outgoing edges from this task
      const outgoingEdges = edges.filter(e => e.from === task.id);

      // Update in-degree for dependent tasks
      outgoingEdges.forEach(edge => {
        const toDegree = inDegree.get(edge.to)! - 1;
        inDegree.set(edge.to, toDegree);

        if (toDegree === 0) {
          const dependentTask = tasks.find(t => t.id === edge.to);
          if (dependentTask) {
            queue.push(dependentTask);
          }
        }
      });
    }

    // Check for cycle (if not all tasks are in result)
    if (result.length !== tasks.length) {
      throw new Error('Cycle detected in DAG - cannot execute tasks with circular dependencies');
    }

    return result;
  }
}
