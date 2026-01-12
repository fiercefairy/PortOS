import { Router } from 'express';
import { asyncHandler, ServerError } from '../lib/errorHandler.js';

/**
 * Create PortOS-specific prompts routes
 * Wraps toolkit routes to match PortOS API contract
 */
export function createPortOSPromptsRoutes(aiToolkit) {
  const router = Router();
  const promptsService = aiToolkit.services.prompts;

  // GET /api/prompts - List all stages (wrapped in {stages: ...})
  router.get('/', asyncHandler(async (req, res) => {
    const stages = promptsService.getStages();
    res.json({ stages });
  }));

  // GET /api/prompts/variables - List all variables (wrapped in {variables: ...})
  router.get('/variables', asyncHandler(async (req, res) => {
    const variables = promptsService.getVariables();
    res.json({ variables });
  }));

  // GET /api/prompts/variables/:key - Get a variable
  router.get('/variables/:key', asyncHandler(async (req, res) => {
    const variable = promptsService.getVariable(req.params.key);
    if (!variable) {
      throw new ServerError('Variable not found', { status: 404, code: 'NOT_FOUND' });
    }
    res.json({ key: req.params.key, ...variable });
  }));

  // POST /api/prompts/variables - Create a variable
  router.post('/variables', asyncHandler(async (req, res) => {
    const { key, name, category, content } = req.body;
    if (!key || !content) {
      throw new ServerError('key and content are required', { status: 400, code: 'VALIDATION_ERROR' });
    }
    await promptsService.createVariable(key, { name, category, content });
    res.json({ success: true, key });
  }));

  // PUT /api/prompts/variables/:key - Update a variable
  router.put('/variables/:key', asyncHandler(async (req, res) => {
    const { name, category, content } = req.body;
    await promptsService.updateVariable(req.params.key, { name, category, content });
    res.json({ success: true });
  }));

  // DELETE /api/prompts/variables/:key - Delete a variable
  router.delete('/variables/:key', asyncHandler(async (req, res) => {
    await promptsService.deleteVariable(req.params.key);
    res.json({ success: true });
  }));

  // GET /api/prompts/:stage - Get stage with template
  router.get('/:stage', asyncHandler(async (req, res) => {
    const stage = promptsService.getStage(req.params.stage);
    if (!stage) {
      throw new ServerError('Stage not found', { status: 404, code: 'NOT_FOUND' });
    }
    const template = await promptsService.getStageTemplate(req.params.stage);
    res.json({ ...stage, template });
  }));

  // POST /api/prompts - Create a new stage
  router.post('/', asyncHandler(async (req, res) => {
    const { stageName, name, description, model = 'default', returnsJson = false, variables = [], template = '' } = req.body;
    if (!stageName || !name) {
      throw new ServerError('stageName and name are required', { status: 400, code: 'VALIDATION_ERROR' });
    }
    const config = { name, description, model, returnsJson, variables };
    await promptsService.createStage(stageName, config, template);
    res.json({ success: true, stageName });
  }));

  // PUT /api/prompts/:stage - Update stage config and/or template
  router.put('/:stage', asyncHandler(async (req, res) => {
    const { template, ...config } = req.body;

    if (Object.keys(config).length > 0) {
      await promptsService.updateStageConfig(req.params.stage, config);
    }
    if (template !== undefined) {
      await promptsService.updateStageTemplate(req.params.stage, template);
    }
    res.json({ success: true });
  }));

  // DELETE /api/prompts/:stage - Delete a stage
  router.delete('/:stage', asyncHandler(async (req, res) => {
    await promptsService.deleteStage(req.params.stage);
    res.json({ success: true });
  }));

  // POST /api/prompts/:stage/preview - Preview compiled prompt
  router.post('/:stage/preview', asyncHandler(async (req, res) => {
    const { testData = {} } = req.body;
    const preview = await promptsService.previewPrompt(req.params.stage, testData);
    res.json({ preview });
  }));

  // POST /api/prompts/reload - Reload prompts from disk
  router.post('/reload', asyncHandler(async (req, res) => {
    await promptsService.init();
    res.json({ success: true });
  }));

  return router;
}
