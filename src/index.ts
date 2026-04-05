// Model Orchestration Platform - Entry Point
// 项目代号：MOP（Model Orchestration Platform）

import express from 'express';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { OrchestrateRequest, OrchestrateResponse, DAG, CostAnalysis } from './types';
import { globalModelRegistry } from './models/registry';
import { TaskScheduler } from './schedulers/scheduler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

// List available models
app.get('/api/models', (req, res) => {
  const models = globalModelRegistry.list();
  res.json({
    models: models.map(m => ({
      name: m.name,
      provider: m.provider,
      capabilities: m.capabilities,
    })),
  });
});

// Main orchestration endpoint
app.post('/api/orchestrate', async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  try {
    const { task, strategy = 'balanced', customDAG }: OrchestrateRequest = req.body;

    if (!task && !customDAG) {
      return res.status(400).json({ error: 'Missing required field: task or customDAG' });
    }

    console.log(`\n[${requestId}] 🎯 New orchestration request`);
    console.log(`[${requestId}]    Task: ${task || 'Custom DAG'}`);
    console.log(`[${requestId}]    Strategy: ${strategy}`);

    // Step 1: Generate or use custom DAG
    // MVP: For now, we require customDAG. Task analyzer will be implemented in Phase 2.
    let dag: DAG;
    if (customDAG) {
      dag = customDAG;
      console.log(`[${requestId}]    Using custom DAG`);
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
      console.log(`[${requestId}]    Created default DAG (single task)`);
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

    console.log(`[${requestId}] ✅ Orchestration completed successfully`);

    res.json(response);
  } catch (error: any) {
    const executionTime = (Date.now() - startTime) / 1000;
    console.error(`[${requestId}] ❌ Orchestration failed after ${executionTime.toFixed}s:`, error.message);

    const response: OrchestrateResponse = {
      status: 'failed',
      error: error.message,
      execution_time: executionTime,
    };

    res.status(500).json(response);
  }
});

// Start server (listen on all interfaces)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Model Orchestration Platform is running`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Remote: http://169.254.197.215:${PORT}`);
  console.log(`\n📦 Registered models:`);
  globalModelRegistry.list().forEach(m => {
    console.log(`   - ${m.name} (${m.provider})`);
  });
});
