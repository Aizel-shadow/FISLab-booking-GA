const { test } = require('node:test');
const assert = require('node:assert/strict');
const Store = require('../reservation-store.js');
const Receipt = require('../receipt.js');
function storage() { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }
function request() {
  const labId = Store.LABS[0].id, date = Store.today();
  return { labId, date, slot: Store.SLOTS.find(slot => !Store.isOccupied(labId, date, slot, [])), email: 'usuario@epn.edu.ec', code: '2026001', reason: 'Practica' };
}
test('HU-06: pendiente no tiene comprobante, aprobar lo persiste y consultar conserva el codigo', () => {
  const db = storage(), input = request(); const { record } = Store.reserve(db, input);
  assert.equal(record.receiptCode, undefined);
  assert.throws(() => Store.getReceipt(db, record.id));
  Store.processRequest(db, record.id, 'Aprobada');
  const saved = Store.read(db)[0];
  assert.match(saved.receiptCode, /^EPN-\d{4}-[A-Z0-9-]+$/);
  const receipt = Store.getReceipt(db, record.id);
  assert.deepEqual(receipt, { system: 'FISLab-booking', institution: 'Escuela Polit\u00e9cnica Nacional', receiptCode: saved.receiptCode, laboratory: Store.LABS[0].name, faculty: `Facultad de ${Store.LABS[0].faculty}`, date: input.date, slot: input.slot, email: input.email, applicantCode: input.code, status: 'APROBADA' });
  assert.equal(Store.getReceipt(db, record.id).receiptCode, saved.receiptCode);
  Store.setMaintenance(db, input.labId, true);
  assert.equal(Store.getReceipt(db, record.id).receiptCode, saved.receiptCode);
  Store.cancel(db, record.id);
  assert.throws(() => Store.getReceipt(db, record.id));
});
test('HU-06: otra aprobacion tiene codigo distinto y rechazo no emite comprobante', () => {
  const db = storage(), input = request();
  const first = Store.reserve(db, input).record;
  Store.processRequest(db, first.id, 'Aprobada');
  const next = { ...input, slot: Store.SLOTS.find(slot => !Store.isOccupied(input.labId, input.date, slot, Store.read(db))) };
  const second = Store.reserve(db, next).record;
  Store.processRequest(db, second.id, 'Aprobada');
  assert.notEqual(Store.getReceipt(db, first.id).receiptCode, Store.getReceipt(db, second.id).receiptCode);
  const thirdInput = { ...input, slot: Store.SLOTS.find(slot => !Store.isOccupied(input.labId, input.date, slot, Store.read(db))) };
  const third = Store.reserve(db, thirdInput).record;
  Store.processRequest(db, third.id, 'Rechazada');
  assert.throws(() => Store.getReceipt(db, third.id));
  assert.equal(Store.read(db).find(r => r.id === third.id).receiptCode, undefined);
});
test('HU-06: aprobaciones anteriores reciben codigo persistente sin inventar facultad historica', () => {
  const db = storage(); const old = { ...request(), labId: 'fim-01', id: 'historica', status: 'Aprobada', createdAt: new Date().toISOString() };
  db.setItem(Store.STORAGE_KEY, JSON.stringify([old]));
  const receipt = Store.getReceipt(db, old.id);
  assert.equal(receipt.faculty, 'No registrada');
  assert.equal(Store.getReceipt(db, old.id).receiptCode, receipt.receiptCode);
});
test('HU-06: el dibujo organiza todos los datos y ajusta textos largos sin salir del lienzo', () => {
  const db = storage(); const record = Store.reserve(db, request()).record;
  Store.processRequest(db, record.id, 'Aprobada');
  const receipt = Store.getReceipt(db, record.id);
  receipt.email = 'a'.repeat(138) + '@epn.edu.ec';
  const painted = [];
  const ctx = { measureText: text => ({ width: text.length * 15 }), fillRect() {}, fillText(text, x, y) { painted.push({ text, x, y }); } };
  const canvas = { getContext: () => ctx };
  Receipt.draw(canvas, receipt);
  assert.equal(canvas.width, 1200);
  assert.ok(painted.every(item => item.y < canvas.height && item.text.length * 15 <= 1040));
  const text = painted.map(item => item.text).join('');
  for (const value of [receipt.system, receipt.institution, receipt.receiptCode, ...Receipt.fields(receipt).map(row => row[1])]) assert.ok(text.includes(value), value);
});
