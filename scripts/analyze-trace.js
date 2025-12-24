import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const traceDir = path.join(__dirname, '../temp_trace');
const traceFile = path.join(traceDir, '0-trace.network'); // Trace events are often in .trace or .network depending on version, let's find the .trace file
// Actually, in recent Playwright versions, the main events are in a file ending in `.trace` inside the zip.
// Let's list files to be sure.
// Wait, listing showed `0-trace.stacks` and resource files.
// The main trace events should be in `trace.trace` or similar.
// I'll search for it.

const files = fs.readdirSync(traceDir);
const traceFileName = files.find(f => f.endsWith('.trace'));

if (!traceFileName) {
    console.error("No .trace file found in unzip!");
    process.exit(1);
}

const content = fs.readFileSync(path.join(traceDir, traceFileName), 'utf-8');
const lines = content.split('\n');

let layoutCount = 0;
let paintCount = 0;
let styleCount = 0;

lines.forEach(line => {
    if (!line.trim()) return;
    try {
        const event = JSON.parse(line);
        // Trace events usually have "name" or "cat" (category)
        // Chrome trace format: { name: "Layout", ... }

        // Playwright internal trace might differ, but often wraps Chrome trace events
        // Look for "metadata" or just scan for standard names.

        if (event.name === 'Layout') layoutCount++;
        if (event.name === 'UpdateLayoutTree') styleCount++; // Style recalc
        if (event.name === 'Paint') paintCount++;

        // Also check for 'args' which might contain more info
    } catch (e) {
        // ignore
    }
});

console.log("--- Trace Analysis ---");
console.log(`Layout Events: ${layoutCount}`);
console.log(`Style Recalc Events: ${styleCount}`);
console.log(`Paint Events: ${paintCount}`);

if (layoutCount > 100) {
    console.log("VERDICT: Layout Thrashing Detected! (Significantly > 0 during scroll)");
} else {
    console.log("VERDICT: Layout seems clean. Bottleneck is likely Paint/GPU.");
}
