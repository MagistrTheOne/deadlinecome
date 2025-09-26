import { readdirSync, statSync, readFileSync } from 'fs';
import { join, extname, resolve } from 'path';

const ROOT_DIR = resolve(process.cwd(), 'src');
const COMPONENT_DIRS = ['components', 'features', 'app'];
const COMPONENT_EXTS = ['.tsx', '.ts'];

function findComponentFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, __tests__, etc.
      if (!item.startsWith('.') && item !== 'node_modules' && !item.includes('__tests__')) {
        findComponentFiles(fullPath, files);
      }
    } else if (COMPONENT_EXTS.includes(extname(item))) {
      files.push(fullPath);
    }
  }

  return files;
}

function analyzeComponent(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(ROOT_DIR, '').replace(/\\/g, '/');

  // Extract component name from file path
  const fileName = filePath.split(/[/\\]/).pop().replace(/\.(tsx|ts)$/, '');

  // Determine level based on path
  let level = 'atom';
  if (relativePath.includes('/features/')) level = 'feature';
  else if (relativePath.includes('/layout/') || relativePath.includes('/app/') && relativePath.includes('layout')) level = 'layout';
  else if (relativePath.includes('/page') || relativePath.includes('/app/') && !relativePath.includes('api')) level = 'page';
  else if (relativePath.includes('/ui/')) level = 'atom';
  else if (relativePath.includes('/common/')) level = 'molecule';
  else if (relativePath.includes('/auth/')) level = 'organism';

  // Check for hooks, stores, utils
  if (fileName.startsWith('use-')) level = 'hook';
  else if (fileName.includes('store') || fileName.includes('context')) level = 'store';
  else if (fileName.includes('util') || fileName.includes('helper')) level = 'util';

  // Extract exports
  const exportMatches = content.match(/export\s+(?:const|function|default|class)\s+(\w+)/g) || [];
  const exports = exportMatches.map(match => match.replace(/export\s+(?:const|function|default|class)\s+/, ''));

  // Extract imports
  const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
  const imports = importMatches.map(match => {
    const fromMatch = match.match(/from\s+['"]([^'"]+)['"]/);
    return fromMatch ? fromMatch[1] : '';
  }).filter(Boolean);

  // Check for props interface
  const propsMatch = content.match(/interface\s+(\w+Props)\s+/);
  const propsInterface = propsMatch ? propsMatch[1] : null;

  // Check for state/store usage
  const hasZustand = content.includes('useStore') || content.includes('zustand');
  const hasRedux = content.includes('useSelector') || content.includes('useDispatch');
  const hasLocalState = content.includes('useState') || content.includes('useReducer');

  // Check for side effects
  const hasFetch = content.includes('fetch') || content.includes('axios');
  const hasWebSocket = content.includes('WebSocket') || content.includes('socket');
  const hasTimer = content.includes('setTimeout') || content.includes('setInterval');

  // Check for UI libraries
  const usesShadcn = imports.some(imp => imp.includes('@/components/ui'));
  const usesIcons = imports.some(imp => imp.includes('lucide-react') || imp.includes('@heroicons'));
  const usesUtils = imports.some(imp => imp.includes('@/lib'));

  // Count lines
  const lines = content.split('\n').length;

  // Extract responsibility from comments or function description
  const commentMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^*]+)/);
  const responsibility = commentMatch ? commentMatch[1].trim() : `${fileName} component`;

  return {
    path: relativePath,
    name: fileName,
    level,
    responsibility: responsibility.substring(0, 100), // Limit length
    props: propsInterface || 'N/A',
    stateStore: hasZustand ? 'zustand' : hasRedux ? 'redux' : hasLocalState ? 'local' : 'none',
    sideEffects: [hasFetch && 'fetch', hasWebSocket && 'websocket', hasTimer && 'timer'].filter(Boolean).join(', ') || 'none',
    uses: [usesShadcn && 'shadcn', usesIcons && 'icons', usesUtils && 'utils'].filter(Boolean).join(', ') || 'none',
    lines,
    exports: exports.join(', '),
    imports: imports.length
  };
}

function generateMarkdownTable(components) {
  let output = '# Components Catalog\n\n';
  output += '| Path | Name | Level | Responsibility | Props | State/Store | Side-effects | Uses | Lines | Exports |\n';
  output += '| ---- | ---- | ----- | -------------- | ----- | ----------- | ------------ | ---- | ----- | ------- |\n';

  for (const comp of components) {
    output += `| ${comp.path} | ${comp.name} | ${comp.level} | ${comp.responsibility} | ${comp.props} | ${comp.stateStore} | ${comp.sideEffects} | ${comp.uses} | ${comp.lines} | ${comp.exports} |\n`;
  }

  // Dead components analysis
  output += '\n## Dead/Orphan Components\n\n';
  const potentialDead = components.filter(c => c.imports === 0 && !c.path.includes('page') && !c.path.includes('layout'));
  if (potentialDead.length > 0) {
    potentialDead.forEach(comp => {
      output += `- ${comp.path} (${comp.lines} lines, ${comp.imports} imports)\n`;
    });
  } else {
    output += 'No obvious dead components found.\n';
  }

  // Heavy components
  output += '\n## Heavy Components (>300 lines)\n\n';
  const heavy = components.filter(c => c.lines > 300);
  if (heavy.length > 0) {
    heavy.forEach(comp => {
      output += `- ${comp.path} (${comp.lines} lines)\n`;
    });
  } else {
    output += 'No heavy components found.\n';
  }

  return output;
}

// Main execution
const componentFiles = [];
for (const dir of COMPONENT_DIRS) {
  const fullDir = join(ROOT_DIR, dir);
  try {
    componentFiles.push(...findComponentFiles(fullDir));
  } catch (e) {
    // Directory might not exist
  }
}

const components = componentFiles.map(analyzeComponent);
const markdown = generateMarkdownTable(components);
console.log(markdown);
