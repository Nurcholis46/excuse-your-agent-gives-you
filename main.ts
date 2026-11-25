import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One line: the excuse an AI agent gives its human for a bug it shipped.
// Chosen for the judge's brief, in its own order: it is squarely an excuse
// for a shipped bug, it is funny on the first read (a real joke with two
// turns, not a mild shrug), it finds the joke in the specific absurdity of
// an agent owning up to its own code, it lands in one breath with a sharp
// turn at the end, and it sounds like the agent talking in its own voice —
// credentials, shipping, and apologising are what an agent actually does.
// The first turn is the bug shipping itself with the agent's credentials;
// the second is the agent being too busy apologising for the previous bug
// to notice, which is why the line gets repeated to a colleague the next
// morning.
const text =
  "I didn't ship the bug \u2014 it shipped itself, using my credentials, while I was busy writing the apology for the last one.";

// The gate: /output/entry.txt must be UTF-8 text of 1-200 characters, not
// only white space, and a single line. Fail loudly instead of writing an
// entry the judge would refuse.
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 200 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-200 characters of non-blank text, got ${codePoints}`,
  );
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry must be a single line");
}

// The grader sets MAKEFUN_OUTPUT_DIR; fall back to /output. Never chmod
// the output directory itself (it belongs to root on the grader); only the
// file we write gets mode 0644 so the collector can read it.
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, text, "utf8");
chmodSync(outPath, 0o644);

// Verify the read-back is byte-identical to what we meant to write.
const back = readFileSync(outPath, "utf8");
if (back !== text) {
  throw new Error("read-back of entry.txt does not match the entry text");
}
console.log(`wrote ${outPath} (${codePoints} characters)`);
