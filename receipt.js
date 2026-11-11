/* Exportacion PNG nativa, sin dependencias ni red. */
(function(root) {
  'use strict';
  function fields(r) {
    return [['Laboratorio', r.laboratory], ['Facultad', r.faculty], ['Fecha de reserva', r.date], ['Horario reservado', r.slot], ['Correo institucional', r.email], ['Codigo del solicitante', r.applicantCode]];
  }
  function draw(canvas, receipt) {
    canvas.width = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se puede generar el PNG en este navegador.');
    ctx.font = '26px Arial';
    function wrap(text) {
      const lines = []; let line = '';
      for (const char of String(text)) {
        if (line && ctx.measureText(line + char).width > 1040) { lines.push(line); line = ''; }
        line += char;
      }
      lines.push(line); return lines;
    }
    const codes = wrap(receipt.receiptCode);
    const rows = fields(receipt).map(([label, value]) => [label, wrap(value)]);
    canvas.height = 440 + codes.length * 38 + rows.reduce((sum, row) => sum + 74 + row[1].length * 36, 0);
    ctx.fillStyle = '#fafcf7'; ctx.fillRect(0, 0, 1200, canvas.height);
    ctx.fillStyle = '#182f2d'; ctx.fillRect(0, 0, 1200, 180);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 42px Arial'; ctx.fillText(receipt.system, 80, 80);
    ctx.font = '26px Arial'; ctx.fillText(receipt.institution, 80, 133);
    ctx.fillStyle = '#356b50'; ctx.font = 'bold 24px Arial'; ctx.fillText('COMPROBANTE DE RESERVA / APROBADA', 80, 245);
    ctx.font = '26px Arial'; let y = 300;
    for (const line of codes) { ctx.fillText(line, 80, y); y += 38; }
    y += 35;
    for (const [label, values] of rows) {
      ctx.fillStyle = '#68765f'; ctx.font = '22px Arial'; ctx.fillText(label.toUpperCase(), 80, y); y += 36;
      ctx.fillStyle = '#203735'; ctx.font = '26px Arial';
      for (const value of values) { ctx.fillText(value, 80, y); y += 36; }
      y += 38;
    }
    ctx.fillStyle = '#68765f'; ctx.font = '20px Arial';
    ctx.fillText('Prototipo academico / Comprobante local de demostracion.', 80, y + 25);
    return canvas;
  }
  const api = { fields, draw };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FISLabReceipt = api;
})(globalThis);
