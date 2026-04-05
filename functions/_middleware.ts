// Middleware: handle root path, let /api/* routes through
export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Only handle root path, let /api/* routes pass through to their handlers
  if (path === '/') {
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Model Orchestration Platform (MOP)</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 80px auto;
      padding: 0 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #666; }
    .badge {
      display: inline-block;
      background: #666;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 14px;
      margin-bottom: 20px;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .endpoint {
      background: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    .method {
      display: inline-block;
      background: #22c55e;
      color: white;
      padding: 2px 8px;
      border-radius: 3px;
      font-weight: bold;
      font-size: 12px;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <span class="badge">v0.1.0</span>
  <h1>Model Orchestration Platform (MOP)</h1>
  <p>大模型聚合转发平台 - 根据任务自动分发模型，支持任务拆解和结果聚合</p>

  <h2>API Endpoints</h2>

  <div class="endpoint">
    <span class="method">GET</span>
    <code>/api/health</code>
    <p>Health check endpoint</p>
  </div>

  <div class="endpoint">
    <span class="method">GET</span>
    <code>/api/models</code>
    <p>List available models</p>
  </div>

  <div class="endpoint">
    <span class="method">POST</span>
    <code>/api/orchestrate</code>
    <p>Main orchestration endpoint</p>
    <pre style="background: #f4f4f4; padding: 12px; border-radius: 4px; overflow-x: auto;">{
  "task": "写一份 AI 工具对比报告",
  "strategy": "balanced"
}</pre>
  </div>

  <h2>Documentation</h2>
  <p>See <a href="https://github.com/sherlock-huang/model-orchestration" target="_blank">GitHub Repository</a> for full documentation.</p>
</body>
</html>`,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }

  // Let all other paths pass through to their handlers
  return context.next();
}
