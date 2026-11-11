(function () {
  'use strict';
  const Store = window.FISLabStore;
  const $ = selector => document.querySelector(selector);
  const facultyFilter = $('#faculty-filter');
  const timeFilter = $('#time-filter');
  const dateFilter = $('#date-filter');
  const bookingDialog = $('#booking-dialog');
  const bookingForm = $('#booking-form');
  const bookingLab = $('#booking-lab');
  const bookingDate = $('#booking-date');
  const bookingTime = $('#booking-time');
  let records = [];
  let maintenance = {};
  const occupied = (lab, date, slot) => Store.isOccupied(lab, date, slot, records, maintenance);
  let receiptReservationId = null;
  let pendingCancellation = null;
  let toastTimeout;
  let dateAtRender = Store.today();

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#i-${name}`);
    svg.append(use);
    return svg;
  }

  function iconText(name, text, className) {
    const span = element('span', className);
    span.append(icon(name), document.createTextNode(text));
    return span;
  }

  function formatDate(date, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
    return new Intl.DateTimeFormat('es-EC', options).format(new Date(`${date}T12:00:00`));
  }

  function storageError(error) {
    $('#storage-warning').textContent = error.message;
    $('#storage-warning').hidden = false;
  }

  function refreshRecords() {
    try {
      records = Store.read(window.localStorage);
      maintenance = Store.readMaintenance(window.localStorage);
      $('#storage-warning').hidden = true;
      return true;
    } catch (error) {
      storageError(error);
      return false;
    }
  }

  function selectedDate() { return dateFilter.value; }

  function renderStats() {
    $('#lab-stat').textContent = Store.LABS.length;
    const count = Store.LABS.reduce((sum, lab) => sum + Store.SLOTS.filter(slot => !occupied(lab.id, selectedDate(), slot)).length, 0);
    $('#slot-stat').textContent = count;
    $('#reservation-stat').textContent = records.length;
    $('#nav-count').textContent = records.length;
  }

  function renderLabs() {
    dateAtRender = selectedDate();
    const filtered = Store.LABS.filter(lab => facultyFilter.value === 'all' || lab.faculty === facultyFilter.value);
    const shownSlots = timeFilter.value === 'all' ? Store.SLOTS : [timeFilter.value];
    const grid = $('#lab-grid');
    grid.replaceChildren();
    for (const lab of filtered) {
      const card = element('article', 'lab-card');
      const top = element('div', 'lab-card-top');
      const symbol = element('span', `lab-symbol ${lab.color}`);
      symbol.append(icon(lab.icon));
      top.append(symbol, element('span', 'room-badge', lab.room));
      const heading = element('h3', '', lab.name);
      const faculty = element('p', 'faculty-name', `Facultad de ${lab.faculty}`);
      const meta = element('div', 'lab-meta');
      meta.append(iconText('users', `Capacidad máxima: ${lab.capacity} personas`), iconText('pin', lab.location));
      const equipment = element('section', 'equipment-list');
      equipment.setAttribute('aria-label', 'Equipamiento disponible');
      const equipmentItems = element('ul');
      for (const item of lab.equipment) equipmentItems.append(element('li', '', item));
      equipment.append(element('h4', '', 'Equipamiento disponible'), equipmentItems);
      const slotsHeading = element('div', 'slots-heading');
      const freeCount = shownSlots.filter(slot => !occupied(lab.id, selectedDate(), slot)).length;
      slotsHeading.append(element('span', '', 'FRANJAS HORARIAS'), element('small', '', `${freeCount} ${freeCount === 1 ? 'disponible' : 'disponibles'}`));
      const slots = element('div', `time-slots${shownSlots.length === 1 ? ' single-slot' : ''}`);
      for (const slot of shownSlots) {
        const isBusy = occupied(lab.id, selectedDate(), slot);
        const isMaintenance = Boolean(maintenance[lab.id]);
        const isPending = records.some(r => r.labId === lab.id && r.date === selectedDate() && r.slot === slot && r.status === 'Pendiente');
        const state = isMaintenance ? 'maintenance' : isBusy ? 'occupied' : 'available';
        const label = isMaintenance ? 'En mantenimiento' : isPending ? 'Pendiente' : isBusy ? 'Ocupada' : 'Disponible';
        const button = element('button', `slot ${state}${isPending ? ' pending' : ''}`);
        button.type = 'button';
        button.disabled = isBusy;
        button.setAttribute('aria-label', `${slot}, ${label.toLowerCase()}, ${lab.name}`);
        button.dataset.lab = lab.id;
        button.dataset.slot = slot;
        const status = element('span');
        status.append(element('i', `dot ${state}`), document.createTextNode(label));
        button.append(element('strong', '', slot), status);
        button.addEventListener('click', () => openBooking(lab.id, slot));
        slots.append(button);
      }
      const bottom = element('div', 'lab-card-bottom');
      bottom.append(iconText('info', 'Reserva con correo EPN'));
      card.append(top, heading, faculty, meta, equipment, slotsHeading, slots, bottom);
      grid.append(card);
    }
    const count = $('#results-count');
    count.replaceChildren(element('strong', '', String(filtered.length)), document.createTextNode(` ${filtered.length === 1 ? 'laboratorio encontrado' : 'laboratorios encontrados'}`));
    $('#selected-date-label').textContent = formatDate(selectedDate(), { weekday: 'long', day: 'numeric', month: 'long' });
    $('#empty-labs').hidden = filtered.length > 0;
    renderStats();
  }

  function renderReservations() {
    const list = $('#reservation-list');
    list.replaceChildren();
    const ordered = [...records].sort((a, b) => a.date.localeCompare(b.date) || a.slot.localeCompare(b.slot));
    for (const record of ordered) {
      const lab = Store.LABS.find(item => item.id === record.labId) || Store.LEGACY_LABS.find(item => item.id === record.labId);
      const card = element('article', 'reservation-card');
      const symbol = element('span', 'stat-icon');
      symbol.append(icon(lab.icon));
      const content = element('div', 'reservation-content');
      const heading = element('h3', '', lab.name);
      const number = element('span', 'reservation-id', `RESERVA · ${record.id.slice(0, 8).toUpperCase()}`);
      const meta = element('div', 'reservation-meta');
      meta.append(iconText('calendar', formatDate(record.date)), iconText('clock', record.slot), iconText('pin', lab.room));
      const statusLine = element('div');
      statusLine.append(element('span', 'reservation-status', Store.statusOf(record)), number);
      const email = element('div', 'reservation-email', `${record.email} · Código ${record.code}`);
      const cancel = element('button', 'button secondary', 'Cancelar reserva');
      cancel.type = 'button';
      cancel.hidden = record.status === 'Rechazada';
      cancel.setAttribute('aria-label', `Cancelar reserva de ${lab.name}, ${formatDate(record.date)}, ${record.slot}`);
      cancel.addEventListener('click', () => {
        pendingCancellation = record.id;
        $('#cancel-description').textContent = `${lab.name} · ${formatDate(record.date)} · ${record.slot}`;
        $('#cancel-dialog').showModal();
      });
      content.append(heading, meta, statusLine, element('p', 'reservation-reason', record.reason), email);
      card.append(symbol, content, cancel);
      if (Store.statusOf(record) === 'Aprobada') {
        const receiptButton = element('button', 'button primary', 'Ver comprobante');
        receiptButton.type = 'button';
        receiptButton.addEventListener('click', () => openReceipt(record.id));
        card.append(receiptButton);
      }
      list.append(card);
    }
    $('#empty-reservations').hidden = records.length > 0;
  }

  function renderAll() {
    renderLabs();
    renderReservations();
    renderPanel();
  }

  function renderPanel() {
    const list = $('#pending-list');
    list.replaceChildren();
    const pending = records.filter(record => record.status === 'Pendiente');
    if (!pending.length) list.append(element('p', 'notice', 'No hay solicitudes pendientes.'));
    for (const record of pending) {
      const lab = [...Store.LABS, ...Store.LEGACY_LABS].find(lab => lab.id === record.labId);
      const card = element('article', 'reservation-card');
      const content = element('div', 'reservation-content');
      content.append(element('h3', '', lab.name), element('p', '', `${record.email} ? C?digo ${record.code}`), element('p', '', `${formatDate(record.date)} ? ${record.slot}`), element('p', 'reservation-reason', record.reason), element('span', 'reservation-status pending', 'Pendiente'));
      card.append(content);
      for (const status of ['Aprobada', 'Rechazada']) {
        const button = element('button', 'button secondary', status === 'Aprobada' ? 'Aprobar' : 'Rechazar');
        button.addEventListener('click', () => {
          try { Store.processRequest(window.localStorage, record.id, status); refreshRecords(); renderAll(); showToast(`Solicitud ${status.toLowerCase()}.`); if (status === 'Aprobada') openReceipt(record.id); }
          catch (error) { storageError(error); }
        });
        card.append(button);
      }
      list.append(card);
    }
    const management = $('#maintenance-list');
    management.replaceChildren();
    for (const lab of Store.LABS) {
      const row = element('div', 'reservation-card');
      const label = element('label', 'reservation-content', lab.name + ' ? En mantenimiento ');
      const checkbox = element('input');
      checkbox.type = 'checkbox'; checkbox.checked = Boolean(maintenance[lab.id]);
      checkbox.addEventListener('change', () => {
        try { Store.setMaintenance(window.localStorage, lab.id, checkbox.checked); refreshRecords(); renderAll(); if (bookingDialog.open) updateBookingOptions(); showToast('Mantenimiento actualizado.'); }
        catch (error) { checkbox.checked = !checkbox.checked; storageError(error); }
      });
      label.append(checkbox); row.append(label); management.append(row);
    }
  }

  function openReceipt(id) {
    try {
      const receipt = Store.getReceipt(window.localStorage, id);
      receiptReservationId = id;
      const content = $('#receipt-content');
      content.replaceChildren(element('p', 'receipt-code', receipt.receiptCode));
      const details = element('dl', 'receipt-details');
      for (const [label, value] of window.FISLabReceipt.fields(receipt)) {
        details.append(element('dt', '', label), element('dd', '', value));
      }
      content.append(details);
      $('#receipt-error').hidden = true;
      if (!$('#receipt-dialog').open) $('#receipt-dialog').showModal();
    } catch (error) { storageError(error); }
  }

  $('#download-receipt').addEventListener('click', () => {
    const errorBox = $('#receipt-error');
    errorBox.hidden = true;
    try {
      // Releer antes de exportar: una reserva cancelada ya no es valida.
      const receipt = Store.getReceipt(window.localStorage, receiptReservationId);
      const canvas = window.FISLabReceipt.draw(document.createElement('canvas'), receipt);
      canvas.toBlob(blob => {
        if (!blob) { errorBox.textContent = 'No se pudo generar el PNG.'; errorBox.hidden = false; return; }
        try {
          Store.getReceipt(window.localStorage, receiptReservationId);
          const url = URL.createObjectURL(blob);
          const link = element('a');
          link.href = url; link.download = `${receipt.receiptCode}.png`;
          document.body.append(link); link.click(); link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 30000);
        } catch (error) { errorBox.textContent = error.message; errorBox.hidden = false; }
      }, 'image/png');
    } catch (error) { errorBox.textContent = error.message; errorBox.hidden = false; }
  });

  function clearErrors() {
    bookingForm.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    bookingForm.querySelectorAll('.field-error').forEach(error => { error.textContent = ''; });
    $('#form-error').hidden = true;
  }

  function showErrors(errors) {
    let first;
    for (const [field, message] of Object.entries(errors)) {
      const input = $(`#booking-${field}`);
      input.setAttribute('aria-invalid', 'true');
      $(`#booking-${field}-error`).textContent = message;
      if (!first) first = input;
    }
    if (first) first.focus();
  }

  function updateBookingOptions(preferredSlot = bookingTime.value) {
    bookingTime.replaceChildren();
    const available = [];
    for (const slot of Store.SLOTS) {
      const occupied = Store.isOccupied(bookingLab.value, bookingDate.value, slot, records, maintenance);
      const option = new Option(`${slot}${occupied ? ' · Ocupada' : ''}`, slot);
      option.disabled = occupied;
      bookingTime.add(option);
      if (!occupied) available.push(slot);
    }
    if (!available.length) {
      const placeholder = new Option('Sin franjas disponibles', '', true, true);
      placeholder.disabled = true;
      bookingTime.add(placeholder, 0);
      bookingTime.value = '';
    } else bookingTime.value = available.includes(preferredSlot) ? preferredSlot : available[0];
    updateBookingSummary();
  }

  function updateBookingSummary() {
    const lab = Store.LABS.find(item => item.id === bookingLab.value);
    $('#booking-lab-name').textContent = lab ? lab.name : 'Selecciona un laboratorio';
    const date = Store.isValidDate(bookingDate.value) ? formatDate(bookingDate.value, { day: 'numeric', month: 'long' }) : 'Selecciona una fecha';
    $('#booking-details').textContent = `${date} · ${bookingTime.value || 'Sin franjas disponibles'}`;
  }

  function openBooking(labId, slot) {
    refreshRecords();
    bookingForm.reset();
    clearErrors();
    bookingLab.value = labId;
    bookingDate.min = Store.today();
    bookingDate.value = selectedDate();
    updateBookingOptions(slot);
    bookingDialog.showModal();
  }

  function showToast(message) {
    clearTimeout(toastTimeout);
    $('#toast-message').textContent = message;
    $('#toast').hidden = false;
    toastTimeout = setTimeout(() => { $('#toast').hidden = true; }, 7000);
  }

  function handleSubmit(event) {
    event.preventDefault();
    clearErrors();
    const request = { labId: bookingLab.value, date: bookingDate.value, slot: bookingTime.value, email: $('#booking-email').value.trim(), code: $('#booking-code').value.trim(), reason: $('#booking-reason').value.trim() };
    const errors = Store.validateRequest(request);
    if (Object.keys(errors).length) { showErrors(errors); return; }
    try {
      const result = Store.reserve(window.localStorage, request);
      if (result.errors) { showErrors(result.errors); return; }
      if (result.conflict) {
        refreshRecords();
        updateBookingOptions();
        renderAll();
        $('#form-error').textContent = 'Esta franja acaba de ocuparse. Selecciona otra franja disponible para continuar.';
        $('#form-error').hidden = false;
        bookingTime.focus();
        return;
      }
      refreshRecords();
      dateFilter.value = request.date;
      renderAll();
      bookingDialog.close();
      window.location.hash = 'reservas';
      showToast('¡Reserva registrada! Tu espacio ya está listo.');
    } catch (error) {
      storageError(error);
      $('#form-error').textContent = error.message;
      $('#form-error').hidden = false;
    }
  }

  function resetFilters() {
    facultyFilter.value = 'all';
    timeFilter.value = 'all';
    dateFilter.min = Store.today();
    dateFilter.value = Store.today();
    dateFilter.setCustomValidity('');
    refreshRecords();
    renderLabs();
  }

  function route(focus = true) {
    const isReservations = window.location.hash === '#reservas';
    const isPanel = window.location.hash === '#laboratorista';
    $('#panel-view').hidden = !isPanel;
    $('#nav-panel').classList.toggle('active', isPanel);
    $('#explore-view').hidden = isReservations || isPanel;
    $('#reservations-view').hidden = !isReservations;
    $('#nav-explore').classList.toggle('active', !isReservations && !isPanel);
    $('#nav-reservations').classList.toggle('active', isReservations);
    $('#nav-explore').toggleAttribute('aria-current', !isReservations && !isPanel);
    $('#nav-reservations').toggleAttribute('aria-current', isReservations);
    $('#nav-panel').removeAttribute('aria-current');
    (isPanel ? $('#nav-panel') : isReservations ? $('#nav-reservations') : $('#nav-explore')).setAttribute('aria-current', 'page');
    $('#breadcrumb-page').textContent = isPanel ? 'Panel del Laboratorista' : isReservations ? 'Mis reservas' : 'Laboratorios';
    document.title = `${$('#breadcrumb-page').textContent} · FISLab-booking-GX`;
    const isPageNavigation = ['', '#explorar', '#reservas', '#laboratorista'].includes(window.location.hash);
    if (focus && isPageNavigation) { $('#main').focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
  }

  for (const faculty of [...new Set(Store.LABS.map(lab => lab.faculty))]) facultyFilter.add(new Option(`Facultad de ${faculty}`, faculty));
  for (const lab of Store.LABS) bookingLab.add(new Option(lab.name, lab.id));
  dateFilter.min = Store.today();
  dateFilter.value = Store.today();
  bookingLab.setAttribute('aria-describedby', 'booking-lab-error');
  for (const filter of [facultyFilter, timeFilter]) filter.addEventListener('change', () => { refreshRecords(); renderLabs(); });
  dateFilter.addEventListener('change', () => {
    if (!Store.isValidDate(dateFilter.value) || dateFilter.value < Store.today()) {
      dateFilter.setCustomValidity('Selecciona una fecha válida, desde hoy en adelante.');
      dateFilter.reportValidity();
      dateFilter.value = dateAtRender;
      dateFilter.setCustomValidity('');
      return;
    }
    dateAtRender = dateFilter.value;
    refreshRecords();
    renderLabs();
  });
  $('#reset-filters').addEventListener('click', resetFilters);
  $('#empty-reset').addEventListener('click', resetFilters);
  $('#guide-button').addEventListener('click', () => $('#guide-dialog').showModal());
  document.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));
  bookingLab.addEventListener('change', () => updateBookingOptions());
  bookingDate.addEventListener('change', () => { refreshRecords(); updateBookingOptions(); });
  bookingTime.addEventListener('change', updateBookingSummary);
  bookingForm.addEventListener('submit', handleSubmit);
  bookingForm.addEventListener('input', event => {
    if (event.target.hasAttribute('aria-invalid')) {
      event.target.removeAttribute('aria-invalid');
      const error = document.getElementById(`${event.target.id}-error`);
      if (error) error.textContent = '';
    }
  });
  $('#confirm-cancel').addEventListener('click', () => {
    try {
      const changed = Store.cancel(window.localStorage, pendingCancellation);
      refreshRecords();
      renderAll();
      $('#cancel-dialog').close();
      showToast(changed ? 'Reserva cancelada. La franja vuelve a estar disponible.' : 'Esta reserva ya no estaba registrada.');
      pendingCancellation = null;
    } catch (error) {
      $('#cancel-dialog').close();
      storageError(error);
      showToast('No se pudo cancelar la reserva. Revisa el aviso de almacenamiento.');
    }
  });
  $('#dismiss-toast').addEventListener('click', () => { $('#toast').hidden = true; });
  window.addEventListener('hashchange', () => route());
  window.addEventListener('storage', event => {
    if (event.key === Store.STORAGE_KEY || event.key === Store.MAINTENANCE_KEY || event.key === null) {
      refreshRecords();
      renderAll();
      if (bookingDialog.open) updateBookingOptions();
    }
  });
  window.addEventListener('focus', () => {
    const currentDate = Store.today();
    dateFilter.min = currentDate;
    bookingDate.min = currentDate;
    if (dateFilter.value < currentDate) dateFilter.value = currentDate;
    refreshRecords();
    renderAll();
    if (bookingDialog.open) updateBookingOptions();
  });
  refreshRecords();
  renderAll();
  route(false);
})();
