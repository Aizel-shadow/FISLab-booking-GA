const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

test('todos los elementos consultados por app.js existen en index.html', () => {
  const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
  const script = readFileSync(join(__dirname, '../app.js'), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'No debe haber IDs duplicados');
  for (const match of script.matchAll(/\$\('#([\w-]+)'\)/g)) {
    assert.ok(ids.includes(match[1]), `Falta #${match[1]} en index.html`);
  }
  for (const id of ['panel-view', 'nav-panel', 'pending-list', 'maintenance-list']) {
    assert.ok(ids.includes(id), `Falta el elemento del panel #${id}`);
  }
});
