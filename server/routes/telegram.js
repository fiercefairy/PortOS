import { Router } from 'express';
import { asyncHandler, ServerError } from '../lib/errorHandler.js';
import { telegramConfigSchema, telegramTestSchema, telegramMethodSchema } from '../lib/telegramValidation.js';
import { getSettings, updateSettings } from '../services/settings.js';
import * as telegram from '../services/telegram.js';
import * as telegramBridge from '../services/telegramBridge.js';

const router = Router();

/**
 * Get the active telegram service based on configured method
 */
async function getActiveService() {
  const settings = await getSettings();
  return settings.telegram?.method === 'mcp-bridge' ? telegramBridge : telegram;
}

// GET /api/telegram/status
router.get('/status', asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const method = settings.telegram?.method || 'manual';

  if (method === 'mcp-bridge') {
    const status = telegramBridge.getStatus();
    res.json({
      method,
      ...status,
      hasToken: status.hasBotToken,
      hasChatId: status.hasChatId,
      forwardTypes: settings.telegram?.forwardTypes || []
    });
  } else {
    const status = telegram.getStatus();
    res.json({
      method,
      ...status,
      hasToken: !!settings.secrets?.telegram?.token,
      hasChatId: !!settings.telegram?.chatId,
      forwardTypes: settings.telegram?.forwardTypes || []
    });
  }
}));

// PUT /api/telegram/method
router.put('/method', asyncHandler(async (req, res) => {
  const result = telegramMethodSchema.safeParse(req.body);
  if (!result.success) {
    throw new ServerError('Validation failed', {
      status: 400,
      code: 'VALIDATION_ERROR',
      context: { details: result.error.errors }
    });
  }

  const { method } = result.data;
  const settings = await getSettings();

  // Save method preference
  await updateSettings({
    telegram: {
      ...settings.telegram,
      method
    }
  });

  // Switch services
  if (method === 'mcp-bridge') {
    // Stop manual bot, start bridge
    await telegram.cleanup();
    const bridgeOk = await telegramBridge.init();
    if (settings.telegram?.forwardTypes) {
      telegramBridge.updateCachedForwardTypes(settings.telegram.forwardTypes);
    }
    const status = telegramBridge.getStatus();
    res.json({
      method,
      ...status,
      hasToken: status.hasBotToken,
      hasChatId: status.hasChatId,
      initialized: bridgeOk
    });
  } else {
    // Stop bridge, start manual bot
    await telegramBridge.cleanup();
    await telegram.init(false);
    if (settings.telegram?.forwardTypes) {
      telegram.updateCachedForwardTypes(settings.telegram.forwardTypes);
    }
    const status = telegram.getStatus();
    res.json({
      method,
      ...status,
      hasToken: !!settings.secrets?.telegram?.token,
      hasChatId: !!settings.telegram?.chatId
    });
  }
}));

// PUT /api/telegram/config (manual bot only)
router.put('/config', asyncHandler(async (req, res) => {
  const result = telegramConfigSchema.safeParse(req.body);
  if (!result.success) {
    throw new ServerError('Validation failed', {
      status: 400,
      code: 'VALIDATION_ERROR',
      context: { details: result.error.errors }
    });
  }

  const { token, chatId } = result.data;
  const settings = await getSettings();

  // Preserve existing token if a new one wasn't provided
  const finalToken = token || settings.secrets?.telegram?.token;

  if (!finalToken) {
    throw new ServerError('Bot token is required', {
      status: 400,
      code: 'VALIDATION_ERROR'
    });
  }

  // Store token in secrets, chatId in telegram
  await updateSettings({
    secrets: {
      ...settings.secrets,
      telegram: { token: finalToken }
    },
    telegram: {
      ...settings.telegram,
      chatId: chatId || settings.telegram?.chatId || ''
    }
  });

  // Initialize bot — send test message only if chatId is configured
  const hasChatId = !!(chatId || settings.telegram?.chatId);
  await telegram.init(hasChatId);
  const status = telegram.getStatus();

  res.json({
    ...status,
    hasToken: true,
    hasChatId
  });
}));

// DELETE /api/telegram/config
router.delete('/config', asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const method = settings.telegram?.method || 'manual';

  if (method === 'mcp-bridge') {
    await telegramBridge.cleanup();
  } else {
    await telegram.cleanup();
  }

  await updateSettings({
    telegram: null,
    secrets: { ...settings.secrets, telegram: undefined }
  });

  res.json({ success: true });
}));

// POST /api/telegram/test
router.post('/test', asyncHandler(async (req, res) => {
  const result = telegramTestSchema.safeParse(req.body);
  if (!result.success) {
    throw new ServerError('Validation failed', {
      status: 400,
      code: 'VALIDATION_ERROR',
      context: { details: result.error.errors }
    });
  }

  const message = result.data.message || '🧪 Test message from PortOS';
  const service = await getActiveService();
  const sendResult = await service.sendMessage(message);

  if (!sendResult.success) {
    throw new ServerError(sendResult.error || 'Failed to send test message', {
      status: 502,
      code: 'TELEGRAM_SEND_FAILED'
    });
  }

  res.json({ success: true });
}));

// PUT /api/telegram/forward-types
router.put('/forward-types', asyncHandler(async (req, res) => {
  const { forwardTypes } = req.body;
  if (!Array.isArray(forwardTypes)) {
    throw new ServerError('forwardTypes must be an array', {
      status: 400,
      code: 'VALIDATION_ERROR'
    });
  }

  const settings = await getSettings();
  await updateSettings({
    telegram: {
      ...settings.telegram,
      forwardTypes
    }
  });

  // Update cache on both services (only the active one matters)
  telegram.updateCachedForwardTypes(forwardTypes);
  telegramBridge.updateCachedForwardTypes(forwardTypes);

  res.json({ success: true, forwardTypes });
}));

// POST /api/telegram/bridge/reload — reload bridge config from MCP plugin files
router.post('/bridge/reload', asyncHandler(async (req, res) => {
  await telegramBridge.reload();
  const status = telegramBridge.getStatus();
  res.json(status);
}));

export default router;
