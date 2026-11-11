/* Datos de demostración y reglas de reserva. No requiere servidor ni dependencias. */
(function (root) {
  'use strict';

  const STORAGE_KEY = 'FISLab-booking-GX.reservations.v1';
  const SLOTS = Object.freeze(['07:00–09:00', '09:00–11:00', '11:00–13:00', '14:00–16:00']);
  const LABS = Object.freeze([
    { id: 'fis-01', name: 'Laboratorio de Desarrollo de Software', faculty: 'Ingeniería de Sistemas', acronym: 'FIS', room: 'FIS · 301', location: 'Edificio de Sistemas', capacity: 24, equipment: 'PCs · Proyector · Internet', icon: 'monitor', color: 'green' },
    { id: 'fie-01', name: 'Laboratorio de Electrónica', faculty: 'Ingeniería Eléctrica y Electrónica', acronym: 'FIEE', room: 'FIEE · 204', location: 'Edificio de Eléctrica', capacity: 20, equipment: 'Circuitos · Osciloscopios', icon: 'circuit', color: 'blue' },
    { id: 'fim-01', name: 'Laboratorio de Diseño Mecánico', faculty: 'Ingeniería Mecánica', acronym: 'FIM', room: 'FIM · 102', location: 'Edificio de Mecánica', capacity: 18, equipment: 'Estaciones CAD · Proyector', icon: 'monitor', color: 'sand' },
    { id: 'fic-01', name: 'Laboratorio de Materiales', faculty: 'Ingeniería Civil y Ambiental', acronym: 'FICA', room: 'FICA · 105', location: 'Edificio de Civil', capacity: 16, equipment: 'Muestras · Equipos de ensayo', icon: 'building', color: 'lilac' },
    { id: 'fiq-01', name: 'Laboratorio de Química Aplicada', faculty: 'Ingeniería Química y Agroindustria', acronym: 'FIQA', room: 'FIQA · 202', location: 'Edificio de Química', capacity: 20, equipment: 'Mesones · Instrumentación', icon: 'flask', color: 'sand' },
    { id: 'fc-01', name: 'Laboratorio de Física Experimental', faculty: 'Ciencias', acronym: 'FC', room: 'FC · 103', location: 'Edificio de Ciencias', capacity: 24, equipment: 'Sensores · Kits de física', icon: 'flask', color: 'blue' }
  ].map(Object.freeze));

  function today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function isValidDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00`);
    return !Number.isNaN(date.getTime()) && date.getFullYear() === Number(value.slice(0, 4)) &&
      date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8, 10));
  }

  function validEmail(value) {
    // El anclaje final impide aceptar @epn.edu.ec.otro-dominio.com.
    return typeof value === 'string' && value.length <= 150 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@epn\.edu\.ec$/i.test(value) &&
      !value.startsWith('.') && !value.includes('..') && !value.includes('.@');
  }

  function validateRequest(input, currentDate = today()) {
    const errors = {};
    if (!LABS.some(lab => lab.id === input.labId)) errors.lab = 'Selecciona un laboratorio válido.';
    if (!isValidDate(input.date) || input.date < currentDate) errors.date = 'Selecciona una fecha válida, desde hoy en adelante.';
    if (!SLOTS.includes(input.slot)) errors.time = 'Selecciona una franja disponible.';
    if (!validEmail(input.email)) errors.email = 'Ingresa un correo institucional válido terminado en @epn.edu.ec.';
    if (typeof input.code !== 'string' || !input.code.trim() || input.code.length > 40) errors.code = 'Ingresa tu código único (máximo 40 caracteres).';
    if (typeof input.reason !== 'string' || !input.reason.trim() || input.reason.length > 500) errors.reason = 'Escribe el motivo de uso (máximo 500 caracteres).';
    return errors;
  }

  function isRecord(record) {
    return record && typeof record === 'object' && typeof record.id === 'string' && record.id.length > 0 && record.id.length <= 80 &&
      typeof record.createdAt === 'string' && !Number.isNaN(Date.parse(record.createdAt)) &&
      Object.keys(validateRequest(record, '0000-01-01')).length === 0;
  }

  function read(storage) {
    let raw;
    try { raw = storage.getItem(STORAGE_KEY); }
    catch { throw new Error('No se puede acceder a localStorage. Permite el almacenamiento local en tu navegador para guardar reservas.'); }
    if (raw === null) return [];
    try {
      const records = JSON.parse(raw);
      if (!Array.isArray(records) || !records.every(isRecord)) throw new Error('Formato inválido');
      const ids = new Set();
      const bookings = new Set();
      for (const record of records) {
        const key = `${record.labId}|${record.date}|${record.slot}`;
        if (ids.has(record.id) || bookings.has(key)) throw new Error('Datos duplicados');
        ids.add(record.id);
        bookings.add(key);
      }
      return records;
    } catch { throw new Error('Los datos de reservas guardados no se pueden leer. No se han sobrescrito. Revisa el almacenamiento de FISLab en tu navegador antes de continuar.'); }
  }

  function write(storage, records) {
    try { storage.setItem(STORAGE_KEY, JSON.stringify(records)); }
    catch { throw new Error('No se pudo guardar el cambio. Revisa el espacio y los permisos de almacenamiento de tu navegador e inténtalo de nuevo.'); }
  }

  function isOccupied(labId, date, slot, records) {
    if (!isValidDate(date)) return true;
    const labIndex = LABS.findIndex(lab => lab.id === labId);
    if (labIndex < 0 || !SLOTS.includes(slot)) return true;
    // Una franja de ejemplo por laboratorio; el patrón varía según el día.
    const sampleIndex = (labIndex + new Date(`${date}T12:00:00`).getDay()) % SLOTS.length;
    return SLOTS[sampleIndex] === slot || records.some(record => record.labId === labId && record.date === date && record.slot === slot);
  }

  function reserve(storage, input) {
    const normalized = { labId: input.labId, date: input.date, slot: input.slot, email: String(input.email || '').trim().toLowerCase(), code: String(input.code || '').trim(), reason: String(input.reason || '').trim() };
    const errors = validateRequest(normalized);
    if (Object.keys(errors).length) return { errors };
    const records = read(storage);
    if (isOccupied(normalized.labId, normalized.date, normalized.slot, records)) return { conflict: true };
    const id = root.crypto && typeof root.crypto.randomUUID === 'function' ? root.crypto.randomUUID() : `res-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const record = { ...normalized, id, createdAt: new Date().toISOString() };
    write(storage, [...records, record]);
    return { record };
  }

  function cancel(storage, id) {
    const records = read(storage);
    if (!records.some(record => record.id === id)) return false;
    write(storage, records.filter(record => record.id !== id));
    return true;
  }

  const api = Object.freeze({ STORAGE_KEY, SLOTS, LABS, today, isValidDate, validEmail, validateRequest, read, isOccupied, reserve, cancel });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FISLabStore = api;
})(globalThis);
