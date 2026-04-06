// Middleware: handle root path with portal, let /api/* routes through
export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Serve portal page for root path
  if (path === '/') {
    // In production, the public/index.html will be served by Cloudflare Pages
    // This middleware is for local development or fallback
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MOP - Model Orchestration Platform</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
      color: #e0e0e0;
      min-height: 100vh;
      padding: 40px 20px;
      text-align: center;
    }
    h1 {
      color: #00d4ff;
      margin-bottom: 16px;
      font-size: 2.5em;
      text-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
    }
    .subtitle {
      color: #888;
      margin-bottom: 40px;
      font-size: 1.2em;
    }
    .api-list {
      max-width: 600px;
      margin: 0 auto;
      text-align: left;
    }
    .api-item {
      background: rgba(26, 26, 46, 0.8);
      border: 1px solid rgba(42, 42, 74, 0.5);
      border-radius: 12px;
      padding: 20px;
      margin: 16px 0;
      transition: all 0.3s ease;
    }
    .api-item:hover {
      border-color: rgba(0, 212, 255, 0.3);
      transform: translateX(8px);
    }
    .api-item code {
      background: rgba(0, 212, 255, 0.1);
      color: #00d4ff;
      padding: 6px 12px;
      border-radius: 6px;
      font-family: 'Monaco', 'Menlo', monospace;
      border: 1px solid rgba(0, 212, 255, 0.2);
    }
    .badge {
      display: inline-block;
      background: #22c55e;
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.8em;
      margin-right: 8px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>🚀 MOP</h1>
  <p class="subtitle">Model Orchestration Platform · 大模型聚合转发平台</p>

  <div class="api-list">
    <div class="api-item">
      <span class="badge">GET</span>
      <code>/api/health</code>
      <p style="margin-top: 12px; color: #888;">健康检查端点</p>
    </div>

    <div class="api-item">
      <span class="badge">GET</span>
      <code>/api/models</code>
      <p style="margin-top: 12px; color: #888;">获取可用模型列表</p>
    </div>

    <div class="api-item">
      <span class="badge">POST</span>
      <code>/api/orchestrate</code>
      <p style="margin-top: 12px; color: #888;">任务编排端点（主要API）</p>
    </div>
  </div>

  <p style="margin-top: 60px; color: #666;">
    <a href="https://github.com/sherlock-huang/model-orchestration" target="_blank" style="color: #00d4ff; text-decoration: none;">GitHub Repository</a>
  </p>
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
  // This includes /api/* routes and static files in public/
  return context.next();
}
