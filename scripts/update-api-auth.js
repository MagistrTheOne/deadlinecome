#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Find all route.ts files in src/app/api
async function findApiRoutes() {
  const pattern = 'src/app/api/**/route.ts';
  return await glob(pattern);
}

// Check if file contains old auth pattern
function hasOldAuth(content) {
  return content.includes('auth.api.getSession') || content.includes('x-user-id');
}

// Update file imports
function updateImports(content) {
  let updated = content;

  // Add requireAuth import if not present
  if (!content.includes("requireAuth")) {
    // Find the import section
    const importMatch = content.match(/import\s+{[^}]*}\s+from\s+["'][^"']*["'];?\s*$/gm);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      const insertPoint = content.indexOf(lastImport) + lastImport.length;

      updated = updated.slice(0, insertPoint) + '\nimport { requireAuth } from "@/lib/auth/guards";\n' + updated.slice(insertPoint);
    }
  }

  return updated;
}

// Update auth checks in functions
function updateAuthChecks(content) {
  let updated = content;

  // Replace auth.api.getSession patterns (more flexible regex)
  updated = updated.replace(
    /const\s+session\s+=\s+await\s+auth\.api\.getSession\(\s*{\s*[\s\S]*?\s*}\s*\);\s*\n\s*if\s*\(\s*!session\s*\)\s*{\s*\n\s*[\s\S]*?return\s+NextResponse\.json\(\s*{\s*error:\s*["']Unauthorized["']\s*}\s*,\s*{\s*status:\s*401\s*}\s*\);\s*\n\s*}/g,
    'const session = await requireAuth(request);'
  );

  // Replace x-user-id patterns
  updated = updated.replace(
    /const\s+userId\s+=\s+request\.headers\.get\(\s*['"]x-user-id['"]\s*\);\s*\n\s*if\s*\(\s*!userId\s*\)\s*{\s*\n\s*return\s+ValidationService\.createErrorResponse\(\s*['"]User ID required['"]\s*,\s*401\s*\);\s*\n\s*}/g,
    'const session = await requireAuth(request);'
  );

  // Replace remaining auth.api.getSession calls that might not follow the exact pattern
  updated = updated.replace(
    /const\s+session\s+=\s+await\s+auth\.api\.getSession\(\s*{\s*[\s\S]*?\s*}\s*\);/g,
    'const session = await requireAuth(request);'
  );

  // Replace remaining unauthorized checks
  updated = updated.replace(
    /if\s*\(\s*!session\s*\)\s*{\s*\n\s*return\s+NextResponse\.json\(\s*{\s*error:\s*["']Unauthorized["']\s*}\s*,\s*{\s*status:\s*401\s*}\s*\);\s*\n\s*}/g,
    ''
  );

  // Replace userId variable usage with session.user.id (but be careful not to replace in comments or strings)
  updated = updated.replace(/\buserId\b(?!\s*[=:])/g, 'session.user.id');

  return updated;
}

// Remove unused auth import if no longer used
function removeUnusedAuthImport(content) {
  if (!content.includes('auth.api.getSession') && content.includes('import { auth }')) {
    content = content.replace(/import\s+{\s*auth\s*}\s+from\s+["']@\/lib\/auth["'];?\s*\n/g, '');
  }
  return content;
}

async function processFile(filePath) {
  console.log(`Processing ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf8');

  if (!hasOldAuth(content)) {
    console.log(`  Skipping - no old auth patterns found`);
    return;
  }

  let updated = content;

  // Update imports
  updated = updateImports(updated);

  // Update auth checks
  updated = updateAuthChecks(updated);

  // Remove unused imports
  updated = removeUnusedAuthImport(updated);

  // Write back if changed
  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    console.log(`  Updated ${filePath}`);
  } else {
    console.log(`  No changes needed for ${filePath}`);
  }
}

async function main() {
  const files = await findApiRoutes();

  console.log(`Found ${files.length} API route files`);

  for (const file of files) {
    // Skip public routes
    if (file.includes('/auth/') || file.includes('/health') || file.includes('/metrics') ||
        file.includes('/webhook') || file.includes('/commands')) {
      console.log(`Skipping public route: ${file}`);
      continue;
    }

    try {
      await processFile(file);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log('Done!');
}

main().catch(console.error);
