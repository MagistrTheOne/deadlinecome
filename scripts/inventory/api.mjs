import { readdirSync, statSync, readFileSync } from 'fs';
import { join, extname, resolve } from 'path';

const API_DIR = resolve(process.cwd(), 'src/app/api');

function findApiRoutes(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules') {
        findApiRoutes(fullPath, files);
      }
    } else if (item === 'route.ts') {
      files.push(fullPath);
    }
  }

  return files;
}

function analyzeApiRoute(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(API_DIR, '').replace(/\\/g, '/').replace('/route.ts', '');

  // Extract HTTP methods
  const methods = [];
  if (content.includes('export async function GET')) methods.push('GET');
  if (content.includes('export async function POST')) methods.push('POST');
  if (content.includes('export async function PUT')) methods.push('PUT');
  if (content.includes('export async function PATCH')) methods.push('PATCH');
  if (content.includes('export async function DELETE')) methods.push('DELETE');

  // Check for input validation (Zod, validation service)
  const hasZod = content.includes('zod') || content.includes('schema');
  const hasValidation = content.includes('ValidationService') || hasZod;
  const inputSchema = hasZod ? 'Zod schema' : hasValidation ? 'ValidationService' : 'None';

  // Check for auth
  const hasAuth = content.includes('x-user-id') || content.includes('auth') || content.includes('session');

  // Check for rate limiting
  const hasRateLimit = content.includes('rateLimit') || content.includes('RateLimit');

  // Check for cache
  const hasCache = content.includes('Cache-Control') || content.includes('ETag') || content.includes('cache');

  // Check for realtime
  const hasRealtime = content.includes('WebSocket') || content.includes('SSE') || content.includes('realtime');

  // Check for DB operations
  const dbTables = [];
  if (content.includes('boards')) dbTables.push('boards');
  if (content.includes('projects')) dbTables.push('projects');
  if (content.includes('tasks')) dbTables.push('tasks');
  if (content.includes('users')) dbTables.push('users');
  if (content.includes('workspaces')) dbTables.push('workspaces');
  if (content.includes('ai')) dbTables.push('ai_*');

  // Determine response statuses
  const statuses = [];
  if (content.includes('200') || content.includes('createSuccessResponse')) statuses.push('200');
  if (content.includes('201')) statuses.push('201');
  if (content.includes('400') || content.includes('createErrorResponse')) statuses.push('400');
  if (content.includes('401')) statuses.push('401');
  if (content.includes('403')) statuses.push('403');
  if (content.includes('404')) statuses.push('404');
  if (content.includes('429')) statuses.push('429');
  if (content.includes('500')) statuses.push('500');
  if (content.includes('502')) statuses.push('502');
  if (content.includes('503')) statuses.push('503');

  // Risks analysis
  const risks = [];
  if (!hasValidation) risks.push('missing-validation');
  if (content.includes('eval(') || content.includes('exec(')) risks.push('security-risk');
  if (content.includes('console.log(')) risks.push('debug-leak');
  if (methods.includes('POST') && !content.includes('idempotent')) risks.push('non-idempotent-post');
  if (hasAuth && content.includes('x-user-id') && !content.includes('validate')) risks.push('weak-auth');

  // Count lines
  const lines = content.split('\n').length;

  return {
    path: relativePath,
    methods: methods.join(', '),
    inputSchema,
    outputSchema: 'JSON',
    statuses: statuses.join(', '),
    auth: hasAuth ? 'session' : 'public',
    rateLimit: hasRateLimit ? 'yes' : 'no',
    cache: hasCache ? 'Cache-Control' : 'none',
    realtime: hasRealtime ? 'WebSocket' : 'none',
    dbTouch: dbTables.join(', ') || 'none',
    risks: risks.join(', ') || 'none',
    lines
  };
}

function generateMarkdownTable(routes) {
  let output = '# API Catalog\n\n';
  output += '| Path | Methods | Input Schema | Output Schema | Statuses | Auth | Rate-limit | Cache | Realtime | DB Touch | Risks |\n';
  output += '| ---- | ------- | ------------ | ------------- | -------- | ---- | ---------- | ----- | -------- | -------- | ----- |\n';

  for (const route of routes) {
    output += `| ${route.path} | ${route.methods} | ${route.inputSchema} | ${route.outputSchema} | ${route.statuses} | ${route.auth} | ${route.rateLimit} | ${route.cache} | ${route.realtime} | ${route.dbTouch} | ${route.risks} |\n`;
  }

  // Generate API_MAP.json
  const apiMap = {};
  for (const route of routes) {
    const path = route.path;
    apiMap[path] = {
      methods: route.methods.split(', '),
      input: route.inputSchema,
      output: route.outputSchema,
      auth: route.auth,
      rateLimit: route.rateLimit === 'yes',
      cache: route.cache,
      realtime: route.realtime !== 'none'
    };
  }

  output += '\n## API Map JSON\n\n```json\n' + JSON.stringify(apiMap, null, 2) + '\n```\n';

  return output;
}

// Main execution
const apiRoutes = findApiRoutes(API_DIR);
const routes = apiRoutes.map(analyzeApiRoute);
const markdown = generateMarkdownTable(routes);
console.log(markdown);
