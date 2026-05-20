import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const sourceFiles = fs.readdirSync(path.join(repoRoot, 'src'))
    .filter((file) => /\.(ts|js)$/.test(file))
    .map((file) => path.join(repoRoot, 'src', file));
const nativeDialogPattern = new RegExp('\\b' + 'pro' + 'mpt' + '\\s*\\(');
const internalMethodWordPattern = new RegExp('\\b' + 'pro' + 'mpts?' + '\\b', 'i');
function readSource() {
    return sourceFiles.map((file) => ({ file, text: fs.readFileSync(file, 'utf8') }));
}
test('public source avoids native browser modal dialogs and internal method wording', () => {
    for (const { file, text } of readSource()) {
        assert.doesNotMatch(text, nativeDialogPattern, path.basename(file));
        assert.doesNotMatch(text, internalMethodWordPattern, path.basename(file));
    }
});
test('HTML renderers declare escaping helpers before using template rendering', () => {
    for (const { file, text } of readSource().filter((entry) => /-app\.(ts|js)$|app\.(ts|js)$/.test(entry.file))) {
        if (!/innerHTML|insertAdjacentHTML/.test(text))
            continue;
        assert.match(text, /function\s+(esc|escapeHtml)\b|const\s+(esc|escapeHtml)\b/, path.basename(file));
    }
});
test('localStorage corruption paths warn before resetting saved state', () => {
    const localStorageSources = readSource().filter((entry) => /localStorage\.getItem/.test(entry.text));
    assert.ok(localStorageSources.length > 0);
    for (const { file, text } of localStorageSources) {
        assert.doesNotMatch(text, /catch\s*\{\s*\}/, path.basename(file));
    }
});
//# sourceMappingURL=safety-regression.test.js.map