document.addEventListener("DOMContentLoaded", () => {
  initSchedule();
  initCalendar();
  initNotifications();
  initUserMenu();
  initQuickActions();
  initModal();
  initSidebarNav();
  initReports();
  initSettings();
  initFooter();
  refreshAll();
});

/* ---------- DATOS DE HORARIO ---------- */
const HOURS = [
  "7:00 - 8:00",
  "8:00 - 9:00",
  "9:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 1:00",
];

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

let scheduleData = [
  {
    Lunes: { subject: "Matemática", docente: "Prof. Ana López", group: "Grupo 1A", room: "Aula 101" },
    Martes: { subject: "Física", docente: "Prof. Carlos Martínez", group: "Grupo 1B", room: "Aula 102" },
    Miércoles: { subject: "Química", docente: "Prof. Elena Ramírez", group: "Grupo 1A", room: "Aula 103" },
    Jueves: { subject: "Matemática", docente: "Prof. Ana López", group: "Grupo 1B", room: "Aula 101" },
    Viernes: null,
  },
  {
    Lunes: { subject: "Inglés", docente: "Prof. Jorge Pérez", group: "Grupo 1A", room: "Aula 104" },
    Martes: { subject: "Lenguaje", docente: "Prof. Marta Gómez", group: "Grupo 1B", room: "Aula 105" },
    Miércoles: { subject: "Física", docente: "Prof. Carlos Martínez", group: "Grupo 1A", room: "Aula 102" },
    Jueves: { subject: "Inglés", docente: "Prof. Jorge Pérez", group: "Grupo 1B", room: "Aula 104" },
    Viernes: null,
  },
  {
    Lunes: { subject: "Química", docente: "Prof. Elena Ramírez", group: "Grupo 1B", room: "Aula 103" },
    Martes: { subject: "Matemática", docente: "Prof. Ana López", group: "Grupo 1A", room: "Aula 101" },
    Miércoles: { subject: "Inglés", docente: "Prof. Jorge Pérez", group: "Grupo 1A", room: "Aula 104" },
    Jueves: { subject: "Química", docente: "Prof. Elena Ramírez", group: "Grupo 1A", room: "Aula 103" },
    Viernes: null,
  },
  {
    Lunes: { subject: "Historia", docente: "Prof. Luis Herrera", group: "Grupo 1B", room: "Aula 106" },
    Martes: { subject: "Educ. Física", docente: "Prof. Luis Herrera", group: "Grupo 1A", room: "Cancha" },
    Miércoles: { subject: "Historia", docente: "Prof. Luis Herrera", group: "Grupo 1A", room: "Aula 106" },
    Jueves: { subject: "Educ. Física", docente: "Prof. Luis Herrera", group: "Grupo 1B", room: "Cancha" },
    Viernes: null,
  },
  {
    Lunes: null,
    Martes: null,
    Miércoles: null,
    Jueves: null,
    Viernes: null,
  },
  { recess: true },
];

/* ---------- DATOS DE DOCENTES ---------- */
let docentesData = [
  { name: "Prof. Ana López", email: "ana.lopez@escuela.edu", phone: "8888-1001" },
  { name: "Prof. Carlos Martínez", email: "carlos.martinez@escuela.edu", phone: "8888-1002" },
  { name: "Prof. Elena Ramírez", email: "elena.ramirez@escuela.edu", phone: "8888-1003" },
  { name: "Prof. Jorge Pérez", email: "jorge.perez@escuela.edu", phone: "8888-1004" },
  { name: "Prof. Marta Gómez", email: "marta.gomez@escuela.edu", phone: "8888-1005" },
  { name: "Prof. Luis Herrera", email: "luis.herrera@escuela.edu", phone: "8888-1006" },
];

/* ---------- ASIGNACIONES: helpers ---------- */
function getAllAssignments() {
  const list = [];
  HOURS.forEach((hourLabel, rowIndex) => {
    const row = scheduleData[rowIndex];
    if (row.recess) return;
    DAYS.forEach((day) => {
      const entry = row[day];
      if (entry) {
        list.push({ ...entry, day, hourIndex: rowIndex, hourLabel });
      }
    });
  });
  return list;
}

function deleteAssignment(hourIndex, day) {
  scheduleData[hourIndex][day] = null;
  refreshAll();
  showToast("Asignación eliminada");
}

function refreshAll() {
  renderSchedule();
  renderAssignments();
  renderDocentes();
  recomputeStats();
  populateDocentesDatalist();
}

/* ---------- ESTADÍSTICAS ---------- */
function recomputeStats() {
  const entries = getAllAssignments();
  const subjects = new Set(entries.map((e) => e.subject));
  const docentes = new Set(entries.map((e) => e.docente).filter(Boolean));
  const groups = new Set(entries.map((e) => e.group).filter(Boolean));

  document.getElementById("statHoras").textContent = entries.length;
  document.getElementById("statAsignaturas").textContent = subjects.size;
  document.getElementById("statDocentes").textContent = docentesData.length || docentes.size;
  document.getElementById("statGrupos").textContent = groups.size;
}

/* ---------- HORARIO SEMANAL ---------- */
function initSchedule() {
  const onWeekChange = (e, source) => {
    showToast(`Mostrando: ${e.target.value}`);
    [document.getElementById("weekSelect"), document.getElementById("weekSelect2")].forEach((sel) => {
      if (sel && sel !== source) sel.value = e.target.value;
    });
    renderSchedule();
  };

  document.getElementById("weekSelect").addEventListener("change", (e) => onWeekChange(e, e.target));
  document.getElementById("weekSelect2").addEventListener("change", (e) => onWeekChange(e, e.target));
}

function renderSchedule() {
  ["scheduleBody", "scheduleBodyFull"].forEach((tbodyId) => {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = "";

    HOURS.forEach((hourLabel, rowIndex) => {
      const row = scheduleData[rowIndex];
      const tr = document.createElement("tr");

      const hourTd = document.createElement("td");
      hourTd.className = "hour-cell";
      hourTd.textContent = hourLabel;
      tr.appendChild(hourTd);

      if (row.recess) {
        const td = document.createElement("td");
        td.colSpan = DAYS.length;
        td.innerHTML = `<div class="slot recess">☕ Receso</div>`;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }

      DAYS.forEach((day) => {
        const td = document.createElement("td");
        const entry = row[day];

        if (entry) {
          td.innerHTML = `
            <div class="slot" data-hour="${rowIndex}" data-day="${day}">
              <strong>${entry.subject}</strong>
              <span>${entry.docente || ""}</span>
              <span>${entry.group} · ${entry.room}</span>
            </div>`;
        } else {
          td.innerHTML = `<div class="slot empty">—</div>`;
        }
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".slot[data-hour]").forEach((slot) => {
      slot.addEventListener("click", () => {
        const hourIndex = slot.dataset.hour;
        const day = slot.dataset.day;
        const entry = scheduleData[hourIndex][day];
        showToast(`${entry.subject} · ${entry.docente || "Sin docente"} · ${entry.group} · ${entry.room} · ${HOURS[hourIndex]}`);
      });
    });
  });
}

/* ---------- ASIGNACIONES (vista de lista) ---------- */
function renderAssignments() {
  const tbody = document.getElementById("assignmentsBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const entries = getAllAssignments();

  if (entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No hay asignaciones registradas todavía.</td></tr>`;
    return;
  }

  entries.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.subject}</td>
      <td>${entry.docente || "—"}</td>
      <td>${entry.group}</td>
      <td>${entry.room}</td>
      <td>${entry.day}</td>
      <td>${entry.hourLabel}</td>
      <td><button class="row-delete" data-hour="${entry.hourIndex}" data-day="${entry.day}" title="Eliminar">🗑️</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".row-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteAssignment(btn.dataset.hour, btn.dataset.day);
    });
  });
}

/* ---------- DOCENTES ---------- */
function renderDocentes() {
  const grid = document.getElementById("docentesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const entries = getAllAssignments();

  docentesData.forEach((docente) => {
    const classCount = entries.filter((e) => e.docente === docente.name).length;
    const card = document.createElement("div");
    card.className = "docente-card";
    card.innerHTML = `
      <div class="docente-card__avatar">🧑‍🏫</div>
      <strong>${docente.name}</strong>
      <span class="docente-card__badge">${classCount} clase${classCount === 1 ? "" : "s"} / semana</span>
      <div class="docente-card__contact">
        <a href="mailto:${docente.email}">✉️ ${docente.email}</a>
        <a href="tel:${docente.phone}">📞 ${docente.phone}</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

function populateDocentesDatalist() {
  const datalist = document.getElementById("docentesList");
  if (!datalist) return;
  datalist.innerHTML = docentesData.map((d) => `<option value="${d.name}"></option>`).join("");
}

function ensureDocenteExists(name) {
  if (!name) return;
  const exists = docentesData.some((d) => d.name.toLowerCase() === name.toLowerCase());
  if (!exists) {
    const slug = name.toLowerCase().replace(/prof\.?\s*/g, "").trim().replace(/\s+/g, ".");
    docentesData.push({
      name,
      email: `${slug || "docente"}@escuela.edu`,
      phone: "8888-0000",
    });
  }
}

/* ---------- CALENDARIO ---------- */
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

let calendarState = {
  year: 2024,
  month: 4, // Mayo (0-indexed)
  selectedDay: 15,
};

function initCalendar() {
  renderCalendar();

  document.getElementById("prevMonth").addEventListener("click", () => {
    calendarState.month--;
    if (calendarState.month < 0) {
      calendarState.month = 11;
      calendarState.year--;
    }
    calendarState.selectedDay = null;
    renderCalendar();
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    calendarState.month++;
    if (calendarState.month > 11) {
      calendarState.month = 0;
      calendarState.year++;
    }
    calendarState.selectedDay = null;
    renderCalendar();
  });
}

function renderCalendar() {
  const { year, month } = calendarState;
  document.getElementById("calendarLabel").textContent = `${MONTH_NAMES[month]} ${year}`;

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  DAY_LABELS.forEach((label) => {
    const el = document.createElement("div");
    el.className = "day-label";
    el.textContent = label;
    grid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1);
  // Convert Sunday(0)-Saturday(6) to Monday-first index (0=Mon..6=Sun)
  const startOffset = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Previous month's trailing days
  for (let i = startOffset; i > 0; i--) {
    grid.appendChild(makeDayCell(daysInPrevMonth - i + 1, true));
  }

  // Current month's days
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = calendarState.selectedDay === d;
    grid.appendChild(makeDayCell(d, false, isToday, d));
  }

  // Next month's leading days to fill grid to a multiple of 7
  const totalCells = startOffset + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let d = 1; d <= trailing; d++) {
    grid.appendChild(makeDayCell(d, true));
  }
}

function makeDayCell(dayNumber, isMuted, isToday = false, realDay = null) {
  const el = document.createElement("div");
  el.className = "day-cell" + (isMuted ? " is-muted" : "") + (isToday ? " is-today" : "");
  el.textContent = dayNumber;

  if (!isMuted) {
    el.addEventListener("click", () => {
      calendarState.selectedDay = realDay;
      renderCalendar();
      showToast(`Fecha seleccionada: ${realDay} de ${MONTH_NAMES[calendarState.month]}`);
    });
  }
  return el;
}

/* ---------- NOTIFICACIONES ---------- */
function initNotifications() {
  const btn = document.getElementById("notifBtn");
  const dropdown = document.getElementById("notifDropdown");
  const badge = document.getElementById("notifBadge");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("is-open");
    if (dropdown.classList.contains("is-open")) {
      badge.style.display = "none";
    }
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove("is-open");
    }
  });
}

/* ---------- MENÚ DE USUARIO ---------- */
function initUserMenu() {
  const menu = document.getElementById("userMenu");
  menu.addEventListener("click", () => {
    showToast("Menú de usuario: Perfil · Preferencias · Cerrar sesión");
  });
}

/* ---------- ACCIONES RÁPIDAS ---------- */
function initQuickActions() {
  document.getElementById("btnNuevaAsignacion").addEventListener("click", openModal);
  document.getElementById("btnNuevaAsignacion2").addEventListener("click", openModal);

  document.getElementById("btnVerHorarios").addEventListener("click", () => {
    navigateTo("horarios");
  });

  document.getElementById("btnGenerarReporte").addEventListener("click", () => {
    navigateTo("reportes");
    generateReport("asignaciones");
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    showToast("Sesión cerrada");
  });
}

/* ---------- MODAL: NUEVA ASIGNACIÓN ---------- */
function initModal() {
  const overlay = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("modalClose");
  const form = document.getElementById("assignmentForm");
  const hourSelect = document.getElementById("formHora");

  HOURS.forEach((h) => {
    const opt = document.createElement("option");
    opt.value = h;
    opt.textContent = h;
    hourSelect.appendChild(opt);
  });

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const subject = document.getElementById("formAsignatura").value.trim();
    const docente = document.getElementById("formDocente").value.trim();
    const group = document.getElementById("formGrupo").value.trim();
    const room = document.getElementById("formAula").value.trim();
    const day = document.getElementById("formDia").value;
    const hour = document.getElementById("formHora").value;
    const hourIndex = HOURS.indexOf(hour);

    if (hourIndex === -1 || scheduleData[hourIndex].recess) {
      showToast("No se puede asignar en ese horario");
      return;
    }

    scheduleData[hourIndex][day] = { subject, docente, group, room };
    ensureDocenteExists(docente);
    refreshAll();
    closeModal();
    form.reset();
    showToast(`Asignación creada: ${subject} · ${day} · ${hour}`);
  });
}

function openModal() {
  document.getElementById("modalOverlay").classList.add("is-open");
}
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("is-open");
}

/* ---------- NAVEGACIÓN LATERAL / VISTAS ---------- */
const SECTION_LABELS = {
  inicio: "Inicio",
  asignaciones: "Asignaciones",
  horarios: "Horarios",
  docentes: "Docentes",
  reportes: "Reportes",
  configuracion: "Configuración",
};

function initSidebarNav() {
  const items = document.querySelectorAll(".nav__item");
  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(item.dataset.section);
    });
  });
}

function navigateTo(section) {
  const items = document.querySelectorAll(".nav__item");
  items.forEach((i) => i.classList.toggle("is-active", i.dataset.section === section));

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-active", view.id === `view-${section}`);
  });

  const subtitle = document.getElementById("topbarSubtitle");
  if (subtitle) {
    subtitle.textContent = section === "inicio"
      ? "Gestiona la carga horaria de manera sencilla y eficiente."
      : `Sección: ${SECTION_LABELS[section] || section}`;
  }

  showToast(`Mostrando: ${SECTION_LABELS[section] || section}`);
}

/* ---------- REPORTES ---------- */
let reportsHistory = [];

function initReports() {
  document.querySelectorAll(".reports-actions [data-report]").forEach((btn) => {
    btn.addEventListener("click", () => generateReport(btn.dataset.report));
  });
}

function generateReport(type) {
  const labels = {
    asignaciones: "Reporte de asignaciones",
    docentes: "Reporte por docente",
    aulas: "Reporte de uso de aulas",
  };
  const label = labels[type] || "Reporte";

  showToast(`Generando ${label.toLowerCase()}...`);

  setTimeout(() => {
    reportsHistory.unshift({
      label,
      time: new Date().toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }),
    });
    renderReportsHistory();
    showToast(`✅ ${label} generado correctamente`);
  }, 900);
}

function renderReportsHistory() {
  const list = document.getElementById("reportsHistory");
  if (!list) return;
  list.innerHTML = "";

  if (reportsHistory.length === 0) {
    list.innerHTML = `<li class="empty-state">Todavía no se ha generado ningún reporte.</li>`;
    return;
  }

  reportsHistory.forEach((report) => {
    const li = document.createElement("li");
    li.className = "report-item";
    li.innerHTML = `<span>📄 ${report.label}</span><span class="report-item__time">${report.time}</span>`;
    list.appendChild(li);
  });
}

/* ---------- CONFIGURACIÓN / CONTACTO ---------- */
const CONTACT_STORAGE_KEY = "sch_contact_info";

const DEFAULT_CONTACT_INFO = {
  email: "contacto@cargahoraria.edu",
  phone: "8888-0000",
  address: "San Salvador, El Salvador",
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  notifications: true,
};

let contactInfo = loadContactInfo();

function loadContactInfo() {
  try {
    const stored = JSON.parse(localStorage.getItem(CONTACT_STORAGE_KEY));
    return { ...DEFAULT_CONTACT_INFO, ...(stored || {}) };
  } catch (err) {
    return { ...DEFAULT_CONTACT_INFO };
  }
}

function saveContactInfo() {
  localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contactInfo));
}

function initSettings() {
  const form = document.getElementById("settingsForm");

  document.getElementById("cfgNotifications").checked = contactInfo.notifications;
  document.getElementById("cfgEmail").value = contactInfo.email;
  document.getElementById("cfgPhone").value = contactInfo.phone;
  document.getElementById("cfgAddress").value = contactInfo.address;
  document.getElementById("cfgFacebook").value = contactInfo.facebook;
  document.getElementById("cfgInstagram").value = contactInfo.instagram;
  document.getElementById("cfgTwitter").value = contactInfo.twitter;
  document.getElementById("cfgLinkedin").value = contactInfo.linkedin;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    contactInfo = {
      notifications: document.getElementById("cfgNotifications").checked,
      email: document.getElementById("cfgEmail").value.trim(),
      phone: document.getElementById("cfgPhone").value.trim(),
      address: document.getElementById("cfgAddress").value.trim(),
      facebook: document.getElementById("cfgFacebook").value.trim(),
      instagram: document.getElementById("cfgInstagram").value.trim(),
      twitter: document.getElementById("cfgTwitter").value.trim(),
      linkedin: document.getElementById("cfgLinkedin").value.trim(),
    };

    saveContactInfo();
    renderFooter();
    applyNotificationSetting();
    showToast("✅ Configuración guardada");
  });

  applyNotificationSetting();
}

function applyNotificationSetting() {
  const notifBtn = document.getElementById("notifBtn");
  notifBtn.style.display = contactInfo.notifications ? "flex" : "none";
  if (!contactInfo.notifications) {
    document.getElementById("notifDropdown").classList.remove("is-open");
  }
}

/* ---------- FOOTER ---------- */
function initFooter() {
  renderFooter();
}

function renderFooter() {
  const contactList = document.getElementById("footerContact");
  const socialWrap = document.getElementById("footerSocial");
  if (!contactList || !socialWrap) return;

  const contactItems = [];
  if (contactInfo.email) {
    contactItems.push(`<li><a href="mailto:${contactInfo.email}">✉️ ${contactInfo.email}</a></li>`);
  }
  if (contactInfo.phone) {
    contactItems.push(`<li><a href="tel:${contactInfo.phone}">📞 ${contactInfo.phone}</a></li>`);
  }
  if (contactInfo.address) {
    contactItems.push(`<li>📍 ${contactInfo.address}</li>`);
  }
  contactList.innerHTML = contactItems.join("") || `<li>Sin datos de contacto configurados</li>`;

  const socialLinks = [
    { key: "facebook", label: "Facebook", icon: "📘" },
    { key: "instagram", label: "Instagram", icon: "📷" },
    { key: "twitter", label: "X / Twitter", icon: "🐦" },
    { key: "linkedin", label: "LinkedIn", icon: "💼" },
  ];

  const socialItems = socialLinks
    .filter((s) => contactInfo[s.key])
    .map((s) => `<a href="${contactInfo[s.key]}" target="_blank" rel="noopener noreferrer">${s.icon} ${s.label}</a>`);

  socialWrap.innerHTML = socialItems.join("") || `<span class="footer__contact">Configura tus redes en Configuración</span>`;
}

/* ---------- TOAST ---------- */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}