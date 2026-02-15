/*
 * env-terminal-hacker
 *
 * Objetivo: praticar variáveis de ambiente (ConfigMap/env/Secret) no Kubernetes
 * exibindo chave e valor na UI.
 */

require('dotenv').config();

const express = require('express');
const os = require('os');

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const port = Number(process.env.PORT || process.env.APP_PORT || 3000);

// Mensagem exibida quando a variável não foi configurada.
const NOT_FOUND_MSG = 'erro de configuração, valor nao encontrado';

// Se true, mascara valores marcados como "secret".
const REDACT_SECRETS = String(process.env.APP_REDACT_SECRETS || '').toLowerCase() === 'true';

const FIXED_VARS = [
  // ConfigMap / env
  { key: 'APP_NAME', group: 'config', sensitive: false, note: 'nome' },
  { key: 'APP_VERSION', group: 'config', sensitive: false, note: 'versão' },
  { key: 'APP_AUTHOR', group: 'config', sensitive: false, note: 'autor' },
  { key: 'APP_ENV', group: 'config', sensitive: false, note: 'ambiente' },
  { key: 'APP_PORT', group: 'config', sensitive: false, note: 'porta' },
  { key: 'APP_DEBUG', group: 'config', sensitive: false, note: 'debug' },
  { key: 'APP_REGION', group: 'config', sensitive: false, note: 'região' },
  { key: 'APP_TIMEZONE', group: 'config', sensitive: false, note: 'timezone' },
  { key: 'APP_LOG_LEVEL', group: 'config', sensitive: false, note: 'log level' },
  { key: 'APP_ALLOWED_IPS', group: 'config', sensitive: false, note: 'allowlist' },
  { key: 'APP_FEATURE_FLAGS', group: 'config', sensitive: false, note: 'flags' },
  { key: 'APP_BUILD_ID', group: 'config', sensitive: false, note: 'build' },
  { key: 'APP_COMMIT_SHA', group: 'config', sensitive: false, note: 'commit' },
  { key: 'APP_DEPLOYMENT_ID', group: 'config', sensitive: false, note: 'deployment' },
  { key: 'APP_DB_HOST', group: 'config', sensitive: false, note: 'db host' },
  { key: 'APP_DB_PORT', group: 'config', sensitive: false, note: 'db port' },
  { key: 'APP_DB_NAME', group: 'config', sensitive: false, note: 'db name' },
  { key: 'APP_DB_USER', group: 'config', sensitive: false, note: 'db user' },
  { key: 'APP_REDIS_URL', group: 'config', sensitive: false, note: 'redis url' },
  { key: 'APP_PUBLIC_NOTE', group: 'config', sensitive: false, note: 'nota' },
  { key: 'APP_REDACT_SECRETS', group: 'config', sensitive: false, note: 'mascarar secrets' },

  // Secret
  { key: 'APP_PASSWORD', group: 'secret', sensitive: true, note: 'senha' },
  { key: 'APP_DB_PASSWORD', group: 'secret', sensitive: true, note: 'db senha' },
  { key: 'APP_API_KEY', group: 'secret', sensitive: true, note: 'api key' },
  { key: 'APP_JWT_SECRET', group: 'secret', sensitive: true, note: 'jwt secret' },
  { key: 'APP_WEBHOOK_TOKEN', group: 'secret', sensitive: true, note: 'webhook token' },
  { key: 'APP_ENCRYPTION_KEY', group: 'secret', sensitive: true, note: 'encryption key' },
  { key: 'APP_OAUTH_CLIENT_SECRET', group: 'secret', sensitive: true, note: 'oauth secret' },
  { key: 'APP_SSH_PRIVATE_KEY', group: 'secret', sensitive: true, note: 'ssh key' }
];

function isMissing(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

function mask(value) {
  const s = String(value);
  if (s.length <= 4) return '****';
  if (s.length <= 10) return `${s.slice(0, 2)}****${s.slice(-2)}`;
  return `${s.slice(0, 3)}****${s.slice(-3)}`;
}

function readVar(def) {
  const raw = process.env[def.key];
  const missing = isMissing(raw);

  let displayValue;
  if (missing) {
    displayValue = NOT_FOUND_MSG;
  } else if (def.sensitive && REDACT_SECRETS) {
    displayValue = mask(raw);
  } else {
    displayValue = String(raw);
  }

  return {
    key: def.key,
    group: def.group,
    sensitive: def.sensitive,
    note: def.note,
    status: missing ? 'missing' : 'ok',
    value: displayValue
  };
}

function buildEnvDump() {
  const fixed = FIXED_VARS.map(readVar);

  // Extras: qualquer env começando com APP_ ou LEAK_, mas que não esteja na lista fixa.
  const fixedSet = new Set(FIXED_VARS.map((v) => v.key));
  const prefixes = ['APP_', 'LEAK_'];

  const extras = Object.keys(process.env)
    .filter((k) => prefixes.some((p) => k.startsWith(p)))
    .filter((k) => !fixedSet.has(k))
    .sort()
    .map((k) => {
      const raw = process.env[k];
      const missing = isMissing(raw);
      return {
        key: k,
        group: 'extra',
        sensitive: false,
        note: 'extra',
        status: missing ? 'missing' : 'ok',
        value: missing ? NOT_FOUND_MSG : String(raw)
      };
    });

  return { fixed, extras };
}

function buildMeta() {
  const now = new Date();

  return {
    timestamp: now.toISOString(),
    hostname: os.hostname(),
    platform: process.platform,
    node: process.version,
    pid: process.pid,
    uptimeSec: Math.floor(process.uptime())
  };
}

app.get('/', (req, res) => {
  const dump = buildEnvDump();
  res.render('index', {
    meta: buildMeta(),
    fixed: dump.fixed,
    extras: dump.extras,
    notFoundMsg: NOT_FOUND_MSG,
    redacting: REDACT_SECRETS
  });
});

app.get('/api/env', (req, res) => {
  const dump = buildEnvDump();
  res.json({
    meta: buildMeta(),
    notFoundMsg: NOT_FOUND_MSG,
    redacting: REDACT_SECRETS,
    fixed: dump.fixed,
    extras: dump.extras
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.listen(port, () => {
  console.log(`[env-terminal-hacker] listening on :${port}`);
});
