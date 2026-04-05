// Health check endpoint
import { RequestContext } from '@cloudflare/workers-types';

export async function onRequest(context: RequestContext) {
  return Response.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
}
