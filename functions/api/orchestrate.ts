// Main orchestration endpoint
import { RequestContext } from '@cloudflare/workers-types';
import { OrchestrateRequest, OrchestrateResponse, DAG, CostAnalysis } from '../_shared/types';
import { globalModelRegistry, initializeModels } from '../_shared/registry';
import { TaskScheduler } from '../_shared/scheduler';

export async function onRequest(context: RequestContext) {
  // @ts-ignore - Cloudflare provides request
  const request = context.request;

  // Initialize models with environment variables
  // @ts-ignore - Cloudflare provides env
  initializeModels(context.env);

  try {
    // Parse request body
    const body: OrchestrateRequest = await request.json();

    const { task, strategy = 'balanced', customDAG }: OrchestrateRequest = body;

    if (!task && !customDAG) {
      return Response.json(
        { error: 'Missing required field: task or customDAG' },
        { status: 400 }
      );
    }

    console.log(`\n[Orchestration] 🎯 New orchestration request`);
    console.log(`[Orchestration]    Task: ${task || 'Custom DAG'}`);
    console.log(`[Orchestration]    Strategy: ${strategy}`);

    // Step 1: Generate or use custom DAG
    // MVP: For now, we require customDAG. Task analyzer will be implemented in Phase 2.
    let dag: DAG;
    if (customDAG) {
      dag = customDAG;
      console.log(`[Orchestration]    Using custom DAG`);
    } else {
      // MVP: Create a simple default DAG
      dag = {
        tasks: [
          {
            id: '1',
            description: task,
            model: 'gpt-4',
            depends_on: [],
          },
        ],
        edges: [],
      };
      console.log(`[Orchestration]    Created default DAG (single task)`);
    }

    // Step 2: Schedule and execute tasks
    const scheduler = new TaskScheduler(globalModelRegistry);
    const schedulerResult = await scheduler.schedule(dag);

    // Step 3: Calculate cost analysis
    const costAnalysis: CostAnalysis = {
      total_cost: schedulerResult.model_breakdown.reduce((sum, m) => sum + m.cost, 0),
      model_breakdown: {},
    };
    schedulerResult.model_breakdown.forEach(b => {
      costAnalysis.model_breakdown[b.model] = b.cost;
    });

    // Step 4: Build response
    // Get the final result (last task in topological order)
    const finalTaskId = dag.tasks[dag.tasks.length - 1].id;
    const finalResult = schedulerResult.results[finalTaskId];

    const response: OrchestrateResponse = {
      status: 'success',
      result: finalResult,
      dag,
      model_breakdown: schedulerResult.model_breakdown,
      cost_analysis: costAnalysis,
      execution_time: schedulerResult.execution_time,
    };

    console.log(`[Orchestration] ✅ Orchestration completed successfully`);

    return Response.json(response);
  } catch (error: any) {
    console.error(`[Orchestration] ❌ Orchestration failed:`, error.message);

    const response: OrchestrateResponse = {
      status: 'failed',
      error: error.message,
    };

    return Response.json(response, { status: 500 });
  }
}
