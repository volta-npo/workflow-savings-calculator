import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter((file) => /\.(ts|json|md|yml|yaml|css|html|py|rs|toml)$/.test(file));

const failures = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (text.includes('\t')) failures.push(`${file}: contains tab characters`);
  if (!text.endsWith('\n')) failures.push(`${file}: missing trailing newline`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
