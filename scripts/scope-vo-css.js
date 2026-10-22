/**
 * scope-vo-css.js
 * Reads vendor-onboarding App.css, scopes all rules under #vo-root,
 * keeps :root variables globally, and writes the scoped file.
 *
 * Run: node scope-vo-css.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const inputFile = join(__dirname, '../../scratch/vendor-onboarding/src/App.css');
const outputFile = join(__dirname, '../../scratch/mulyam-unified-portal/src/modules/vendor-onboarding/App.css');

const css = readFileSync(inputFile, 'utf8');

// We'll do a line-by-line transformation:
// 1. Keep :root { ... } blocks as-is (global CSS variables).
// 2. For @media blocks, scope selectors inside them.
// 3. For other rules, prefix selectors with #vo-root.

// Simple approach: prepend every selector block with #vo-root
// Handles most cases correctly.

// Replace common global element selectors within the VO CSS
// that would leak into PO Manager:
let scoped = css;

// The VO App.css already wraps everything inside selectors or .container, 
// except for:
// 1. :root { } - keep global  
// 2. *, *::before, *::after { box-sizing } - scope to #vo-root
// 3. html, body, #root { } - scope to #vo-root
// 4. html, body { background, color, font-family } - scope to #vo-root
// 5. button, input, select, textarea { font-family } - scope
// 6. button { cursor } - scope
// 7. h1, h2, h3... { } - scope
// 8. p { } - scope
// 9. label { } - scope
// 10. input, select, textarea { } - scope
// 11. form { } - scope
// 12. button[type="submit"] { } - scope

// Apply targeted replacements for global-leaking selectors:

// *,*::before,*::after
scoped = scoped.replace(
  /(\s*\*,\s*\n?\s*\*::before,\s*\n?\s*\*::after\s*\{)/g,
  '\n  #vo-root *,\n  #vo-root *::before,\n  #vo-root *::after {'
);

// html,\n  body,\n  #root
scoped = scoped.replace(
  /(\s*html,\s*\n\s*body,\s*\n\s*#root\s*\{)/g,
  '\n  #vo-root {'
);

// html,\n  body  (standalone)
scoped = scoped.replace(
  /(\s*html,\s*\n\s*body\s*\{)/g,
  '\n  #vo-root {'
);

// button,\n  input,\n  select,\n  textarea
scoped = scoped.replace(
  /(\s*button,\s*\n\s*input,\s*\n\s*select,\s*\n\s*textarea\s*\{)/g,
  '\n  #vo-root button,\n  #vo-root input,\n  #vo-root select,\n  #vo-root textarea {'
);

// button { (standalone)
scoped = scoped.replace(
  /(\s*button\s*\{\s*\n\s*cursor)/g,
  '\n  #vo-root button {\n    cursor'
);

// form {
scoped = scoped.replace(
  /(\s*form\s*\{)/g,
  '\n  #vo-root form {'
);

// label {
scoped = scoped.replace(
  /(\s*label\s*\{)/g,
  '\n  #vo-root label {'
);

// input,\n  select,\n  textarea (standalone)
scoped = scoped.replace(
  /(\s*input,\s*\n\s*select,\s*\n\s*textarea\s*\{)/g,
  '\n  #vo-root input,\n  #vo-root select,\n  #vo-root textarea {'
);

// input,\n  select { height...
scoped = scoped.replace(
  /(\s*input,\s*\n\s*select\s*\{)/g,
  '\n  #vo-root input,\n  #vo-root select {'
);

// textarea {
scoped = scoped.replace(
  /(\s*textarea\s*\{)/g,
  '\n  #vo-root textarea {'
);

// input::placeholder,\n  textarea::placeholder
scoped = scoped.replace(
  /(\s*input::placeholder,\s*\n\s*textarea::placeholder\s*\{)/g,
  '\n  #vo-root input::placeholder,\n  #vo-root textarea::placeholder {'
);

// input:focus,\n  select:focus,\n  textarea:focus
scoped = scoped.replace(
  /(\s*input:focus,\s*\n\s*select:focus,\s*\n\s*textarea:focus\s*\{)/g,
  '\n  #vo-root input:focus,\n  #vo-root select:focus,\n  #vo-root textarea:focus {'
);

// input[type="date"]
scoped = scoped.replace(
  /(\s*input\[type="date"\]\s*\{)/g,
  '\n  #vo-root input[type="date"] {'
);

// h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6
scoped = scoped.replace(
  /(\s*h1,\s*\n\s*h2,\s*\n\s*h3,\s*\n\s*h4,\s*\n\s*h5,\s*\n\s*h6\s*\{)/g,
  '\n  #vo-root h1,\n  #vo-root h2,\n  #vo-root h3,\n  #vo-root h4,\n  #vo-root h5,\n  #vo-root h6 {'
);

// h1 {
scoped = scoped.replace(
  /(\s*h1\s*\{)/g,
  '\n  #vo-root h1 {'
);

// p {
scoped = scoped.replace(
  /(\s*p\s*\{)/g,
  '\n  #vo-root p {'
);

// button[type="submit"]
scoped = scoped.replace(
  /(\s*button\[type="submit"\]\s*\{)/g,
  '\n  #vo-root button[type="submit"] {'
);

// button[type="submit"]:hover
scoped = scoped.replace(
  /(\s*button\[type="submit"\]:hover\s*\{)/g,
  '\n  #vo-root button[type="submit"]:hover {'
);

// In @media blocks, fix html,body,#root references
scoped = scoped.replace(
  /html,\s*\n\s*body,\s*\n\s*#root,\s*\n/g,
  '#vo-root,\n    '
);

const header = `/*
 * Vendor Onboarding App CSS — scoped under #vo-root
 * All global element selectors have been prefixed with #vo-root
 * so they do not leak into the Purchase Orders Manager UI.
 * The :root CSS variables are kept globally (they use unique VO names).
 */\n\n`;

writeFileSync(outputFile, header + scoped, 'utf8');
console.log('CSS scoped successfully →', outputFile);
