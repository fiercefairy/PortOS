/**
 * GSD (Get Stuff Done) API Routes
 *
 * Mounted at /api/cos/gsd
 * Provides endpoints for scanning, analyzing, and acting on GSD project state.
 */

import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ServerError } from '../lib/errorHandler.js'
import * as gsdService from '../services/gsdService.js'
import { addTask } from '../services/cos.js'

const router = Router()

// Validation schemas
const concernIdsSchema = z.object({
  concernIds: z.array(z.string()).optional(),
  all: z.boolean().optional()
}).refine(data => data.all || (data.concernIds && data.concernIds.length > 0), {
  message: 'Either concernIds or all:true is required'
})


// GET /projects — list GSD-enabled projects
router.get('/projects', asyncHandler(async (req, res) => {
  const projects = await gsdService.scanForGsdProjects()
  res.json({ projects })
}))

// GET /projects/:appId — project detail
router.get('/projects/:appId', asyncHandler(async (req, res) => {
  const project = await gsdService.getGsdProject(req.params.appId)
  if (!project) {
    throw new ServerError('GSD project not found', { status: 404, code: 'GSD_PROJECT_NOT_FOUND' })
  }
  res.json(project)
}))

// GET /projects/:appId/concerns — parsed CONCERNS.md with severity
router.get('/projects/:appId/concerns', asyncHandler(async (req, res) => {
  const project = await gsdService.getGsdProject(req.params.appId)
  if (!project) {
    throw new ServerError('GSD project not found', { status: 404, code: 'GSD_PROJECT_NOT_FOUND' })
  }
  res.json({ concerns: project.concerns })
}))

// GET /projects/:appId/phases — phase list with status
router.get('/projects/:appId/phases', asyncHandler(async (req, res) => {
  const project = await gsdService.getGsdProject(req.params.appId)
  if (!project) {
    throw new ServerError('GSD project not found', { status: 404, code: 'GSD_PROJECT_NOT_FOUND' })
  }
  const pendingActions = await gsdService.getGsdPendingActions(req.params.appId)
  res.json({ phases: project.phases, pendingActions })
}))

// GET /projects/:appId/phases/:phaseId — phase detail
router.get('/projects/:appId/phases/:phaseId', asyncHandler(async (req, res) => {
  const project = await gsdService.getGsdProject(req.params.appId)
  if (!project) {
    throw new ServerError('GSD project not found', { status: 404, code: 'GSD_PROJECT_NOT_FOUND' })
  }
  const phase = project.phases.find(p => p.id === req.params.phaseId)
  if (!phase) {
    throw new ServerError('Phase not found', { status: 404, code: 'GSD_PHASE_NOT_FOUND' })
  }
  res.json(phase)
}))

// POST /projects/:appId/concerns/tasks — create CoS tasks from selected concerns
router.post('/projects/:appId/concerns/tasks', asyncHandler(async (req, res) => {
  const body = concernIdsSchema.parse(req.body)
  const allTasks = await gsdService.generateConcernTasks(req.params.appId)

  if (allTasks.length === 0) {
    throw new ServerError('No concerns found for this project', { status: 404, code: 'NO_CONCERNS' })
  }

  const tasksToCreate = body.all
    ? allTasks
    : allTasks.filter(t => body.concernIds.includes(t.metadata.gsdConcern))

  const created = []
  for (const task of tasksToCreate) {
    const result = await addTask(task, 'internal')
    created.push(result)
  }

  console.log(`📋 Created ${created.length} CoS tasks from GSD concerns for ${req.params.appId}`)
  res.json({ created: created.length, tasks: created })
}))

export default router
