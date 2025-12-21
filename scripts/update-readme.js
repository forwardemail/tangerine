#!/usr/bin/env node

/**
 * Update README.md with latest benchmark results
 * This script reads all benchmark_results_*.json files and updates the README
 * with a consolidated markdown table showing performance across Node.js versions
 */

const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const README_PATH = path.join(__dirname, '..', 'README.md');
const RESULTS_DIR = path.join(__dirname, '..');

// Markers for where to insert benchmark results in README
const START_MARKER = '<!-- BENCHMARK_RESULTS_START -->';
const END_MARKER = '<!-- BENCHMARK_RESULTS_END -->';

function generateBenchmarkSection(results) {
  const versions = Object.keys(results).sort((a, b) => {
    // Sort by major version number
    const vA = Number.parseInt(a.replace('v', '').split('.')[0], 10);
    const vB = Number.parseInt(b.replace('v', '').split('.')[0], 10);
    return vA - vB;
  });

  let section = `#### Latest Automated Benchmark Results\n\n`;
  section += `**Last Updated:** ${new Date().toISOString().split('T')[0]}\n\n`;

  // Create a table showing Node.js version info
  section += `| Node Version | Platform | Arch | Timestamp |\n`;
  section += `|--------------|----------|------|----------|\n`;

  for (const version of versions) {
    const data = results[version];
    const timestamp = new Date(data.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    section += `| ${version} | ${data.platform} | ${data.arch} | ${timestamp} |\n`;
  }

  section += `\n`;

  // Add benchmark output for each version
  section += `<details>\n<summary>Click to expand detailed benchmark results</summary>\n\n`;

  for (const version of versions) {
    const data = results[version];
    section += `##### Node.js ${version}\n\n`;

    if (data.benchmarks) {
      for (const [benchName, output] of Object.entries(data.benchmarks)) {
        section += `**${benchName}:**\n\n`;
        section += '```\n';
        section += String(output).trim();
        section += '\n```\n\n';
      }
    }
  }

  section += `</details>\n`;

  return section;
}

function main() {
  console.log('🔄 Updating README with latest benchmark results...\n');

  // Find all benchmark result files
  const files = fs.readdirSync(RESULTS_DIR);
  const resultFiles = files
    .filter(
      (f) => f.startsWith('benchmark_results_node_') && f.endsWith('.json')
    )
    .sort();

  if (resultFiles.length === 0) {
    console.log('ℹ️  No benchmark result files found, skipping update.');
    return;
  }

  console.log(`📊 Found ${resultFiles.length} benchmark result files:`);
  for (const f of resultFiles) console.log(`   - ${f}`);
  console.log('');

  // Load all benchmark results
  const results = {};
  for (const file of resultFiles) {
    try {
      const data = JSON.parse(
        fs.readFileSync(path.join(RESULTS_DIR, file), 'utf8')
      );
      const version = data.node_version;
      results[version] = data;
      console.log(`✅ Loaded results for Node.js ${version}`);
    } catch (err) {
      console.error(`❌ Error loading ${file}:`, err.message);
    }
  }

  if (Object.keys(results).length === 0) {
    console.log('ℹ️  No valid benchmark results loaded, skipping update.');
    return;
  }

  // Generate benchmark results section
  const benchmarkSection = generateBenchmarkSection(results);

  // Read current README
  let readme = fs.readFileSync(README_PATH, 'utf8');

  // Check if markers exist
  if (readme.includes(START_MARKER) && readme.includes(END_MARKER)) {
    // Replace content between markers
    const beforeMarker = readme.slice(
      0,
      readme.indexOf(START_MARKER) + START_MARKER.length
    );
    const afterMarker = readme.slice(readme.indexOf(END_MARKER));
    readme = beforeMarker + '\n\n' + benchmarkSection + '\n\n' + afterMarker;
  } else {
    console.error('❌ Markers not found in README.md');
    console.error(
      'Please add the following markers to README.md where you want benchmark results:'
    );
    console.error(`  ${START_MARKER}`);
    console.error(`  ${END_MARKER}`);
    process.exit(1);
  }

  // Write updated README
  fs.writeFileSync(README_PATH, readme, 'utf8');

  console.log('\n✅ README.md updated successfully!');
  console.log(`📝 Updated: ${README_PATH}`);
}

try {
  main();
} catch (err) {
  console.error('❌ Fatal error:', err);
  process.exit(1);
}
