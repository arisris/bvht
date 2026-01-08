// @file: scripts/generate-context.ts
// @description: Generate context file for AI (Fixed: Uses fs/promises for robust permission handling)

import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

// ==========================================
// CONFIGURATION
// ==========================================
const IGNORE_LIST = [
  "node_modules",
  ".git",
  ".vscode",
  "dist",
  "build",
  "public",
  "drizzle",
  "tmp",
  "bun.lock",
  "scripts/generate-context.ts",
  "project-context.txt",
  "AGENTS.md",
  "README.md",
];

const IGNORE_EXTS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".ico",
  ".svg",
  ".woff",
  ".woff2",
  ".db",
  ".sqlite",
];

const ALLOWED_EXTS = [
  ".ts",
  ".js",
  ".tsx",
  ".jsx",
  ".json",
  ".css",
  ".html",
  ".md",
  ".sql",
  ".prisma",
  ".toml",
  ".yaml",
  ".yml",
];

const AGENT_RULES_FILE = "AGENTS.md";
const OUTPUT_FILE = "project-context.txt";

// ==========================================
// UTILS
// ==========================================

/**
 * Capture current environment details
 */
async function getEnvInfo() {
  let info = "";
  info += `Runtime : Bun v${Bun.version}\n`;
  info += `NodeCompat: ${process.version}\n`;
  info += `Platform: ${process.platform} (${process.arch})\n`;
  return info;
}

/**
 * Recursive Directory Walker using node:fs/promises
 * Handles permission errors gracefully.
 */
async function scanDirectory(dir: string, rootDir: string): Promise<string[]> {
  let results: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(rootDir, fullPath);

      // Check Ignores (Folders & Files)
      // We check if any part of the path matches the ignore list loosely,
      // or exact match for current entry name
      const isIgnored = IGNORE_LIST.some(
        (pattern) => entry.name === pattern || relativePath.includes(pattern)
      );

      if (isIgnored) continue;

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(fullPath, rootDir);
        results = results.concat(subFiles);
      } else {
        // It's a file
        const ext = entry.name.slice(entry.name.lastIndexOf("."));

        // Filter by extensions
        if (IGNORE_EXTS.includes(ext)) continue;
        if (ALLOWED_EXTS.includes(ext)) {
          results.push(relativePath);
        }
      }
    }
  } catch (error: any) {
    // Catch Permission Denied Errors specifically
    if (error.code === "EACCES" || error.code === "EPERM") {
      console.warn(`⚠️  [Skipped] Permission denied: ${dir}`);
    } else {
      console.warn(`⚠️  Error scanning ${dir}: ${error.message}`);
    }
  }

  return results;
}

// ==========================================
// MAIN LOGIC
// ==========================================

async function mergeForAI() {
  console.log("🤖 Preparing project context for AI...");
  const startTime = performance.now();

  // 1. Get Environment Info
  const envInfo = await getEnvInfo();

  // 2. Get Agent Rules
  let agentRulesContent = "";
  const agentFile = Bun.file(AGENT_RULES_FILE);
  if (await agentFile.exists()) {
    console.log(`📜 Found ${AGENT_RULES_FILE}, injecting rules...`);
    agentRulesContent = await agentFile.text();
  }

  // 3. Scan Files (Using new recursive walker)
  console.log("📂 Scanning files...");
  const validFiles = await scanDirectory(".", ".");
  validFiles.sort();

  // 4. Construct Output
  let output = "";

  // Section: Instructions
  output += `<instruction>\n`;
  output += `You are a software engineer, your role is developer for this project.\n`;
  output += `The following is a context file for a software project.\n`;
  output += `Review the <environment> and <agent_rules> first to understand constraints.\n`;
  output += `Then use the <source_code> to answer questions.\n`;
  output += `</instruction>\n\n`;

  // Section: Environment
  output += `<environment>\n`;
  output += envInfo;
  output += `</environment>\n\n`;

  // Section: Rules
  if (agentRulesContent) {
    output += `<agent_rules path="${AGENT_RULES_FILE}">\n`;
    output += agentRulesContent;
    output += `\n</agent_rules>\n\n`;
  }

  // Section: Structure
  output += `<project_structure>\n`;
  validFiles.forEach((file) => (output += ` - ${file}\n`));
  output += `</project_structure>\n\n`;

  // Section: Source Code
  output += `<source_code>\n`;
  let processedCount = 0;

  for (const file of validFiles) {
    try {
      const content = await Bun.file(file).text();
      output += `<file path="${file}">\n`;
      output += content;
      output += `\n</file>\n\n`;
      processedCount++;
    } catch (e) {
      console.warn(`⚠️ Skipped error reading file content: ${file}`);
    }
  }
  output += `</source_code>\n`;

  // 5. Write Output
  await Bun.write(OUTPUT_FILE, output);

  // 6. Stats
  const fileStat = await Bun.file(OUTPUT_FILE).stat();
  const sizeInKB = (fileStat.size / 1024).toFixed(2);
  const duration = ((performance.now() - startTime) / 1000).toFixed(2);

  console.log(`\n\n✅ Context Generated in ${duration}s:`);
  console.log(`   - Environment    : DETECTED`);
  console.log(`   - Rules Injected : ${agentRulesContent ? "YES" : "NO"}`);
  console.log(`   - Files Included : ${processedCount}`);
  console.log(`   - Total Size     : ${sizeInKB} KB`);
  console.log(`   - Output File    : ${OUTPUT_FILE}`);
}

mergeForAI();
