import { spawn } from 'child_process';
import { join } from 'path';
import { PATHS } from '../lib/fileUtils.js';
import { setUpdateInProgress, recordUpdateResult } from './updateChecker.js';

const SCRIPT_PATH = join(PATHS.root, 'scripts', 'portos-update.sh');

/**
 * Execute the PortOS update script for a given release tag.
 * Spawns the script detached so it survives the Node process dying.
 *
 * @param {string} tag - The git tag to update to (e.g. "v1.27.0")
 * @param {function} emit - Callback (step, status, message) for progress
 * @returns {Promise<{success: boolean}>}
 */
export async function executeUpdate(tag, emit) {
  await setUpdateInProgress(true);
  emit('starting', 'running', `Starting update to ${tag}...`);

  return new Promise((resolve) => {
    const child = spawn('bash', [SCRIPT_PATH, tag], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: PATHS.root
    });

    let lastStep = 'starting';

    child.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Parse structured STEP markers: STEP:name:status:message
        const match = trimmed.match(/^STEP:([^:]+):([^:]+):(.*)$/);
        if (match) {
          const [, step, status, message] = match;
          lastStep = step;
          emit(step, status, message);

          // When the script signals it's about to restart, notify client
          if (step === 'restart' && status === 'running') {
            emit('restarting', 'running', `Restarting PortOS with ${tag}...`);
          }
        }
      }
    });

    child.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) {
        console.error(`📦 Update stderr: ${msg}`);
      }
    });

    child.on('close', (code) => {
      const success = code === 0;
      recordUpdateResult({
        version: tag.replace(/^v/, ''),
        success,
        completedAt: new Date().toISOString(),
        log: success ? '' : `Process exited with code ${code}`
      }).catch(e => console.error(`❌ Failed to record update result: ${e.message}`));
      if (success) {
        emit('complete', 'done', `Update to ${tag} complete`);
      } else {
        emit(lastStep, 'error', `Update failed at step "${lastStep}" (exit code ${code})`);
      }
      resolve({ success });
    });

    child.on('error', (err) => {
      recordUpdateResult({
        version: tag.replace(/^v/, ''),
        success: false,
        completedAt: new Date().toISOString(),
        log: err.message
      }).catch(e => console.error(`❌ Failed to record update result: ${e.message}`));
      emit('starting', 'error', `Failed to start update: ${err.message}`);
      resolve({ success: false });
    });

    // Unref so the parent process doesn't wait for the detached child
    child.unref();
  });
}
