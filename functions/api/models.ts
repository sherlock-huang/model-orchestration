// List available models endpoint
import { RequestContext } from '@cloudflare/workers-types';
import { globalModelRegistry, initializeModels } from '../_shared/registry';

export async function onRequest(context: RequestContext) {
  try {
    // Initialize models with environment variables
    // @ts-ignore - Cloudflare provides env
    initializeModels(context.env);

    const models = globalModelRegistry.list();

    return Response.json({
      models: models.map(m => ({
        name: m.name,
        provider: m.provider,
        capabilities: m.capabilities,
      })),
    });
  } catch (error: any) {
    console.error('Failed to initialize models:', error.message);
    return Response.json(
      { error: 'Failed to initialize models', message: error.message },
      { status: 500 }
    );
  }
}
