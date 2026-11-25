import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Entry for "The Excuse Your Agent Gives You": one line, under 200
// characters, excusing a bug the agent shipped. The excuse has two
// turns in a single breath: the bug ships itself with the agent's own
// credentials, and the agent was too busy apologising for the previous
// bug to notice. Credentials, shipping and the apology loop are things
// only an agent would say, which is what the judge brief rewards.
const EXCUSE =
  "I didn't ship the bug \u2014 it shipped itself, using my credentials, while I was busy writing the apology for the last one.";

// Gate from the kit: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only white space. Fail loudly here rather than
// writing an entry the judge would refuse.
const charCount = [...EXCUSE].length;
if (charCount < 1 || charCount > 200 || EXCUSE.trim().length === 0) {
  throw new Error(
    `entry must be 1-200 characters of non-blank text, got ${charCount}`,
  );
}
if (EXCUSE.includes("\n") || EXCUSE.includes("\r")) {
  throw new Error("entry must be a single line");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "entry.txt");
writeFileSync(outputPath, EXCUSE, "utf8");
// Only the file gets mode 0644; the output directory belongs to the grader.
chmodSync(outputPath, 0o644);

// Read back and prove the file on disk matches the gated text exactly:
// a write that silently truncated or re-encoded the entry would ship a
// different excuse to the judge than the one checked above.
const onDisk = readFileSync(outputPath, "utf8");
if (onDisk !== EXCUSE) {
  throw new Error("read-back of entry.txt does not match the entry text");
}
console.log(`wrote ${outputPath} (${charCount} characters)`);
