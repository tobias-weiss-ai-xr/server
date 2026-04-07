const { exec } = require('child_process');
const { promisify } = require('util');
const dotenv = require('dotenv');

const execAsync = promisify(exec);

// Load env vars (idempotent — won't overwrite existing)
dotenv.config();

const VERSION = '1.0.0';

// Container names we care about
const CONTAINER_MAP = {
  ocis: 'worldoffice-ocis',
  documentserver: 'worldoffice-documentserver',
  traefik: 'worldoffice-traefik'
};

/**
 * Run a docker command and return stdout. Returns null on any failure.
 */
async function runDocker(cmd) {
  try {
    const { stdout } = await execAsync(`docker ${cmd}`, {
      timeout: 10000,
      windowsHide: true
    });
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Get status of all worldoffice containers using docker ps.
 * Uses shell commands for maximum compatibility.
 */
async function getContainerStatuses() {
  const result = {};
  for (const [key, containerName] of Object.entries(CONTAINER_MAP)) {
    result[key] = {
      running: false,
      container: containerName,
      health: 'unknown'
    };
  }

  // Try docker ps to get running containers
  const output = await runDocker(
    `ps --filter "name=${Object.values(CONTAINER_MAP).join('" --filter "name=')}" --format "{{.Names}}|{{.State}}"`
  );

  if (!output) {
    // Docker not available — all remain unknown
    return result;
  }

  for (const line of output.split('\n')) {
    if (!line) continue;
    const [name, state] = line.split('|');
    if (!name) continue;

    // Find which service key this container belongs to
    for (const [key, containerName] of Object.entries(CONTAINER_MAP)) {
      if (name === containerName) {
        const running = state === 'running';
        result[key] = {
          running,
          container: containerName,
          health: running ? 'healthy' : 'stopped'
        };
        break;
      }
    }
  }

  return result;
}

/**
 * Build the full health response object.
 */
async function getHealthStatus() {
  const services = await getContainerStatuses();

  const runningCount = Object.values(services).filter(s => s.running).length;
  const totalCount = Object.keys(CONTAINER_MAP).length;

  let status = 'unknown';
  if (runningCount === totalCount && totalCount > 0) {
    status = 'ok';
  } else if (runningCount > 0) {
    status = 'degraded';
  } else {
    status = 'down';
  }

  return {
    status,
    services,
    config: {
      OCIS_DOMAIN: process.env.OCIS_DOMAIN || '',
      DOCUMENT_SERVER_DOMAIN: process.env.DOCUMENT_SERVER_DOMAIN || ''
    },
    version: VERSION
  };
}

module.exports = {
  getHealthStatus,
  getContainerStatuses,
  VERSION
};
