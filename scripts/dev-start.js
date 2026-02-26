/**
 * Dev start script — cleanly (re)starts all PM2 processes.
 * Handles lingering processes, port conflicts, and fresh starts.
 */
import { execSync, spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PM2 = join(__dirname, '..', 'node_modules', 'pm2', 'bin', 'pm2');
const ECO = 'ecosystem.config.cjs';

function pm2(args) {
  execSync(`node "${PM2}" ${args}`, { stdio: 'inherit' });
}

// Stop and delete existing PortOS processes (ignore errors if none exist)
try { pm2(`stop ${ECO}`); } catch {}
try { pm2(`delete ${ECO}`); } catch {}

// Brief pause for port release
await new Promise(r => setTimeout(r, 1500));

// Start fresh and tail logs
pm2(`start ${ECO}`);
spawn(process.execPath, [PM2, 'logs'], { stdio: 'inherit' });
