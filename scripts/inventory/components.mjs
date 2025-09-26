#!/usr/bin/env node

/**
 * Component Inventory Script
 *
 * Автоматически сканирует компоненты и создает каталог.
 * Анализирует структуру, зависимости и потенциальные проблемы.
 */

import fs from 'node:fs';
import path from 'node:path';

const root = 'src';
const exts = ['.tsx', '.ts'];
const components = [];
const issues = [];

// Вспомогательные функции
function walk(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const p = path.join(dir, f);
      try {
        const s = fs.statSync(p);
        if (s.isDirectory()) {
          walk(p);
        } else if (exts.some(e => p.endsWith(e)) && p.includes('components')) {
          analyze(p);
        }
      } catch (error) {
        console.warn(`Warning: Cannot access ${p}:`, error.message);
      }
    }
  } catch (error) {
    console.warn(`Warning: Cannot read directory ${dir}:`, error.message);
  }
}

function analyze(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const name = path.basename(filePath).replace(/\.(tsx|ts)$/, '');
    const level = inferLevel(filePath);
    const analysis = analyzeComponent(code, filePath);

    components.push({
      Path: filePath,
      Name: name,
      Level: level,
      Responsibility: inferResponsibility(code, name),
      Props: analysis.props,
      'State/Store': analysis.state,
      'Side-effects': analysis.sideEffects,
      Uses: analysis.uses,
      'Used by': 0, // Будет заполнено позже
      Risks: analysis.risks,
      LoC: analysis.loc,
      Imports: analysis.imports
    });

    // Анализ проблем
    checkForIssues(filePath, code, analysis);

  } catch (error) {
    console.warn(`Warning: Cannot analyze ${filePath}:`, error.message);
  }
}

function inferLevel(filePath) {
  const dir = path.dirname(filePath);

  if (dir.includes('/atoms/') || dir.includes('/ui/')) return 'atom';
  if (dir.includes('/molecules/')) return 'molecule';
  if (dir.includes('/organisms/')) return 'organism';
  if (dir.includes('/features/')) return 'feature';
  if (dir.includes('/app/') || dir.includes('/pages/')) return 'page';
  if (dir.includes('/layouts/')) return 'layout';
  if (dir.includes('/providers/')) return 'provider';

  return 'component';
}

function inferResponsibility(code, name) {
  // Анализ на основе названия и кода
  const lowerName = name.toLowerCase();

  if (lowerName.includes('modal') || lowerName.includes('dialog')) return 'Modal/Dialog management';
  if (lowerName.includes('form')) return 'Form handling';
  if (lowerName.includes('list') || lowerName.includes('table')) return 'Data display';
  if (lowerName.includes('chart') || lowerName.includes('graph')) return 'Data visualization';
  if (lowerName.includes('button') || lowerName.includes('input')) return 'UI primitive';
  if (lowerName.includes('nav') || lowerName.includes('menu')) return 'Navigation';
  if (lowerName.includes('card')) return 'Content container';
  if (lowerName.includes('layout')) return 'Page layout';

  // Анализ кода
  if (code.includes('useState') || code.includes('useReducer')) return 'State management';
  if (code.includes('useEffect')) return 'Side effects';
  if (code.includes('fetch') || code.includes('axios')) return 'Data fetching';

  return 'UI component';
}

function analyzeComponent(code, filePath) {
  const lines = code.split('\n');
  const loc = lines.length;

  // Анализ импортов
  const imports = [];
  const importMatches = code.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
  importMatches.forEach(match => {
    const fromMatch = match.match(/from\s+['"]([^'"]+)['"]/);
    if (fromMatch) imports.push(fromMatch[1]);
  });

  // Анализ пропсов
  let props = '';
  const propsMatch = code.match(/interface\s+\w+Props\s*\{([^}]*)\}/s);
  if (propsMatch) {
    const propsContent = propsMatch[1];
    const propMatches = propsContent.match(/(\w+):\s*([^;]+)/g) || [];
    props = propMatches.map(p => p.split(':')[0].trim()).join('; ');
  }

  // Анализ состояния
  let state = '';
  const stateMatches = code.match(/useState<[^>]*>\([^)]*\)/g) || [];
  if (stateMatches.length > 0) {
    state = `${stateMatches.length} useState calls`;
  }
  if (code.includes('useReducer')) state += ' useReducer';
  if (code.includes('useContext')) state += ' Context';

  // Анализ side effects
  let sideEffects = '';
  const effectMatches = code.match(/useEffect\(/g) || [];
  if (effectMatches.length > 0) {
    sideEffects = `${effectMatches.length} useEffect`;
  }
  if (code.includes('useLayoutEffect')) sideEffects += ' useLayoutEffect';
  if (code.includes('useImperativeHandle')) sideEffects += ' useImperativeHandle';

  // Анализ зависимостей
  const uses = [];
  if (code.includes('React.')) uses.push('React');
  if (code.includes('useCallback')) uses.push('useCallback');
  if (code.includes('useMemo')) uses.push('useMemo');
  if (code.includes('forwardRef')) uses.push('forwardRef');
  if (code.includes('memo(')) uses.push('React.memo');

  // Анализ рисков
  const risks = [];
  if (loc > 300) risks.push('Large component (>300 LoC)');
  if (imports.length > 15) risks.push('Many dependencies (>15 imports)');
  if (effectMatches.length > 3) risks.push('Multiple useEffect (>3)');
  if (code.includes('any') || code.includes('unknown')) risks.push('Weak typing');
  if (!code.includes('React.memo') && !code.includes('memo(') && stateMatches.length > 0) {
    risks.push('Not memoized (has state)');
  }

  return {
    props,
    state: state || 'None',
    sideEffects: sideEffects || 'None',
    uses: uses.join(', ') || 'None',
    risks: risks.join('; ') || 'None',
    loc,
    imports: imports.length
  };
}

function checkForIssues(filePath, code, analysis) {
  const fileName = path.basename(filePath);

  if (analysis.loc > 300) {
    issues.push({
      component: fileName,
      issue: 'Component too large',
      severity: 'medium',
      description: `${analysis.loc} lines of code. Consider splitting into smaller components.`,
      recommendation: 'Split into smaller components, use composition'
    });
  }

  if (analysis.imports > 15) {
    issues.push({
      component: fileName,
      issue: 'Too many imports',
      severity: 'low',
      description: `${analysis.imports} imports. May indicate tight coupling.`,
      recommendation: 'Consider creating a barrel export or reducing dependencies'
    });
  }

  if (code.includes('console.log') || code.includes('console.error')) {
    issues.push({
      component: fileName,
      issue: 'Console statements in production',
      severity: 'low',
      description: 'Console statements found in component code.',
      recommendation: 'Remove console statements or use proper logging'
    });
  }

  if (code.match(/useEffect.*\[\]/)) {
    issues.push({
      component: fileName,
      issue: 'useEffect without dependencies',
      severity: 'high',
      description: 'useEffect with empty dependency array may cause issues.',
      recommendation: 'Add proper dependencies or remove empty array'
    });
  }
}

// Генерация отчетов
function generateReports() {
  console.log(`📊 Found ${components.length} components`);

  // Генерация COMPONENTS_CATALOG.md
  const header = '| Path | Name | Level | Responsibility | Props | State/Store | Side-effects | Uses | Used by | Risks | LoC |\n|---|---|---|---|---|---|---|---|---:|---|--:|\n';
  const body = components.map(c =>
    `| ${c.Path} | ${c.Name} | ${c.Level} | ${c.Responsibility} | ${c.Props} | ${c['State/Store']} | ${c['Side-effects']} | ${c.Uses} | ${c['Used by']} | ${c.Risks} | ${c.LoC} |`
  ).join('\n');

  fs.writeFileSync('COMPONENTS_CATALOG.md', `# Components Catalog\n\n${header}${body}\n`);
  console.log('✅ COMPONENTS_CATALOG.md generated');

  // Генерация UI_ISSUES.md
  if (issues.length > 0) {
    const issuesHeader = '| Component | Issue | Severity | Description | Recommendation |\n|---|---|---|---|---|\n';
    const issuesBody = issues.map(i =>
      `| ${i.component} | ${i.issue} | ${i.severity} | ${i.description} | ${i.recommendation} |`
    ).join('\n');

    fs.writeFileSync('UI_ISSUES.md', `# UI Issues Report\n\nFound ${issues.length} potential issues.\n\n${issuesHeader}${issuesBody}\n`);
    console.log('✅ UI_ISSUES.md generated');
  } else {
    fs.writeFileSync('UI_ISSUES.md', '# UI Issues Report\n\nNo issues found! 🎉\n');
    console.log('✅ UI_ISSUES.md generated (no issues)');
  }
}

// Запуск
console.log('🔍 Starting component inventory...\n');
walk(root);
generateReports();
console.log('\n🎉 Component inventory complete!');