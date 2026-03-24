import { z } from 'zod';

export const telegramConfigSchema = z.object({
  token: z.string().optional().default(''),
  chatId: z.string().optional().default('')
});

export const telegramTestSchema = z.object({
  message: z.string().optional()
});

export const telegramMethodSchema = z.object({
  method: z.enum(['manual', 'mcp-bridge'])
});
