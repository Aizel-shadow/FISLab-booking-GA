const { test } = require('node:test');
const assert = require('node:assert/strict');
const Store = require('../reservation-store.js');

function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.has(key) ? data.get(key) : null, setItem: (key, value) => data.set(key, value) };
}

function request(overrides = {}) {
  const date = Store.today();
  const labId = Store.LABS[0].id;
  const slot = Store.SLOTS.find(time => !Store.isOccupied(labId, date, time, []));
  return { labId, date, slot, email: 'estudiante@epn.edu.ec', code: '20260001', reason: 'Práctica de Ingeniería de Software II', ...overrides };
}

test('el catálogo presenta los cuatro laboratorios solicitados con sus datos completos', () => {
  assert.deepEqual(Store.LABS.map(lab => lab.name), [
    'Laboratorio de Redes',
    'Laboratorio de Software',
    'Laboratorio de Electrónica',
    'Laboratorio de Física'
  ]);
  for (const lab of Store.LABS) {
    assert.ok(lab.faculty);
    assert.ok(lab.location);
    assert.ok(Number.isInteger(lab.capacity) && lab.capacity > 0);
    assert.ok(Array.isArray(lab.equipment) && lab.equipment.length > 0);
  }
});

test('conserva legibles las reservas históricas de laboratorios retirados sin habilitarlos para nuevas reservas', () => {
  const storage = memoryStorage();
  const record = { ...request({ labId: 'fim-01' }), id: 'res-historica', createdAt: new Date().toISOString() };
  storage.setItem(Store.STORAGE_KEY, JSON.stringify([record]));

  assert.deepEqual(Store.read(storage), [record]);
  assert.ok(Store.LEGACY_LABS.some(lab => lab.id === record.labId));
  assert.ok(Store.validateRequest(request({ labId: record.labId })).lab);
});

test('acepta únicamente el dominio institucional exacto', () => {
  for (const email of ['estudiante@epn.edu.ec', 'docente.nombre@EPN.EDU.EC']) assert.equal(Store.validEmail(email), true);
  for (const email of ['', 'correo@gmail.com', 'usuario@epn.edu.ec.ejemplo.com', 'usuario@sub.epn.edu.ec', '@epn.edu.ec', 'uno@@epn.edu.ec', 'con espacio@epn.edu.ec', 'usuario@epnXeduXec', '.usuario@epn.edu.ec', 'usuario..nombre@epn.edu.ec']) assert.equal(Store.validEmail(email), false, email);
});

test('rechaza cada campo obligatorio vacío o con solo espacios', () => {
  const fields = { labId: 'lab', date: 'date', slot: 'time', email: 'email', code: 'code', reason: 'reason' };
  for (const [field, key] of Object.entries(fields)) {
    assert.ok(Store.validateRequest(request({ [field]: '' }))[key], field);
    assert.ok(Store.validateRequest(request({ [field]: '   ' }))[key], field);
  }
});

test('valida fechas reales, fechas pasadas y límites de texto', () => {
  assert.equal(Store.isValidDate('2026-02-30'), false);
  assert.equal(Store.isValidDate('2028-02-29'), true);
  assert.equal(Store.isValidDate('2026-02-29'), false);
  assert.ok(Store.validateRequest(request({ date: '2020-01-01' })).date);
  assert.ok(Store.validateRequest(request({ code: 'a'.repeat(41) })).code);
  assert.ok(Store.validateRequest(request({ reason: 'a'.repeat(501) })).reason);
});

test('reserva, persiste, rechaza duplicado y cancela liberando la franja', () => {
  const storage = memoryStorage();
  const input = request();
  const result = Store.reserve(storage, input);
  assert.ok(result.record);
  const records = Store.read(storage);
  assert.equal(records.length, 1);
  assert.deepEqual(records[0], result.record);
  assert.equal(Store.isOccupied(input.labId, input.date, input.slot, records), true);
  assert.equal(Store.reserve(storage, input).conflict, true);
  assert.equal(Store.read(storage).length, 1);
  assert.equal(Store.cancel(storage, result.record.id), true);
  assert.equal(Store.read(storage).length, 0);
  assert.equal(Store.isOccupied(input.labId, input.date, input.slot, Store.read(storage)), false);
  assert.equal(Store.cancel(storage, result.record.id), false);
});

test('las ocupaciones de ejemplo no se pueden reservar', () => {
  const storage = memoryStorage();
  const input = request();
  const slot = Store.SLOTS.find(time => Store.isOccupied(input.labId, input.date, time, []));
  assert.equal(Store.reserve(storage, { ...input, slot }).conflict, true);
  assert.equal(Store.read(storage).length, 0);
});

test('las reservas de un día y laboratorio no ocupan otros días ni laboratorios', () => {
  const storage = memoryStorage();
  const input = request();
  Store.reserve(storage, input);
  const records = Store.read(storage);
  const later = new Date(`${input.date}T12:00:00`);
  later.setDate(later.getDate() + 7);
  const date = `${later.getFullYear()}-${String(later.getMonth() + 1).padStart(2, '0')}-${String(later.getDate()).padStart(2, '0')}`;
  assert.equal(Store.isOccupied(input.labId, date, input.slot, records), false);
  const another = Store.LABS.find(lab => lab.id !== input.labId && !Store.isOccupied(lab.id, input.date, input.slot, []));
  assert.equal(Store.isOccupied(another.id, input.date, input.slot, records), false);
});

test('normaliza los datos y relee el almacenamiento antes de confirmar', () => {
  const storage = memoryStorage();
  const input = request({ email: '  DOCENTE@EPN.EDU.EC ', code: ' 1234 ', reason: ' Práctica ' });
  const { record } = Store.reserve(storage, input);
  assert.equal(record.email, 'docente@epn.edu.ec');
  assert.equal(record.code, '1234');
  assert.equal(record.reason, 'Práctica');
  assert.equal(Store.reserve(storage, input).conflict, true);
});

test('una solicitud inválida no escribe datos', () => {
  const storage = memoryStorage();
  assert.ok(Store.reserve(storage, request({ reason: '   ' })).errors.reason);
  assert.equal(storage.getItem(Store.STORAGE_KEY), null);
});

test('datos dañados no se sobrescriben, y errores de almacenamiento no se confirman', () => {
  for (const raw of ['{invalido', '{}', '[{"id":"falso"}]']) {
    const storage = memoryStorage();
    storage.setItem(Store.STORAGE_KEY, raw);
    assert.throws(() => Store.read(storage), /no se pueden leer/);
    assert.throws(() => Store.reserve(storage, request()));
    assert.equal(storage.getItem(Store.STORAGE_KEY), raw);
  }
  const deniedRead = { getItem() { throw new Error('SecurityError'); } };
  assert.throws(() => Store.read(deniedRead), /localStorage/);
  const deniedWrite = { getItem: () => null, setItem() { throw new Error('QuotaExceededError'); } };
  assert.throws(() => Store.reserve(deniedWrite, request()), /No se pudo guardar/);
});
