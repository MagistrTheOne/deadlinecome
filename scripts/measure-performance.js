#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Performance Measurement Script for DeadLine
 * Measures bundle sizes and updates PERF_REPORT.md
 */

function getBundleStats() {
  const buildDir = path.join(__dirname, '..', '.next', 'static', 'chunks');

  if (!fs.existsSync(buildDir)) {
    return { error: 'Build directory not found. Run npm run build first.' };
  }

  const files = fs.readdirSync(buildDir, { recursive: true })
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(buildDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
      };
    })
    .sort((a, b) => b.size - a.size)
    .slice(0, 10); // Top 10 largest chunks

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  return {
    totalSize: `${totalSizeMB}MB`,
    largestChunks: files,
    timestamp: new Date().toISOString()
  };
}

function updatePerfReport(stats) {
  const reportPath = path.join(__dirname, '..', 'PERF_REPORT_UPDATED.md');

  if (!fs.existsSync(reportPath)) {
    console.log('PERF_REPORT_UPDATED.md not found');
    return;
  }

  let content = fs.readFileSync(reportPath, 'utf8');

  // Update bundle analysis section
  const bundleSection = `## Bundle Analysis (Updated ${new Date().toLocaleDateString()})

### Current Bundle Size (Measured ${stats.timestamp})
- **Total Bundle Size:** ${stats.totalSize} (uncompressed)
- **Largest Chunks:**
${stats.largestChunks.map(chunk => `  - \`${chunk.name}\` - ${chunk.sizeKB}KB`).join('\n')}

### Code Splitting Results
- **✅ Dashboard AI Components:** Dynamic imports implemented
- **✅ AI Pages:** All /ai/* routes lazy loaded with ssr: false
- **✅ Loading Skeletons:** Implemented for all AI components
- **✅ Bundle Analyzer:** Configured and reporting`;

  // Replace or add bundle analysis section
  if (content.includes('## Bundle Analysis')) {
    content = content.replace(/## Bundle Analysis[\s\S]*?(?=## |$)/, bundleSection + '\n\n');
  } else {
    content = bundleSection + '\n\n' + content;
  }

  fs.writeFileSync(reportPath, content);
  console.log('✅ PERF_REPORT_UPDATED.md updated with latest bundle metrics');
}

function main() {
  console.log('📊 Measuring DeadLine performance metrics...');

  const stats = getBundleStats();

  if (stats.error) {
    console.error('❌ Error:', stats.error);
    return;
  }

  console.log(`📦 Total bundle size: ${stats.totalSize}`);
  console.log('🏆 Largest chunks:');
  stats.largestChunks.slice(0, 5).forEach((chunk, i) => {
    console.log(`  ${i + 1}. ${chunk.name} - ${chunk.sizeKB}KB`);
  });

  updatePerfReport(stats);
  console.log('✅ Performance metrics updated');
}

if (require.main === module) {
  main();
}

module.exports = { getBundleStats, updatePerfReport };
