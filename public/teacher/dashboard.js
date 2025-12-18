const headerDate = document.getElementById("header-date");
const teacherIdBadge = document.getElementById("teacher-id");
const overviewStatus = document.getElementById("overview-status");
const statStudents = document.getElementById("stat-students");
const statMarked = document.getElementById("stat-marked");
const statUnmarked = document.getElementById("stat-unmarked");

const studentSearch = document.getElementById("student-search");
const toggleAddStudentBtn = document.getElementById("toggle-add-student");
const addStudentForm = document.getElementById("add-student-form");
const addStudentStatus = document.getElementById("add-student-status");
const studentsList = document.getElementById("students-list");
const rosterCount = document.getElementById("roster-count");

const attendanceDateInput = document.getElementById("attendance-date");
const attendanceTableBody = document.getElementById("attendance-table-body");
const reloadAttendanceBtn = document.getElementById("reload-attendance");
const saveAttendanceBtn = document.getElementById("save-attendance");
const attendanceStatus = document.getElementById("attendance-status");

const summarySort = document.getElementById("summary-sort");
const loadSummaryBtn = document.getElementById("load-summary");
const summaryBody = document.getElementById("summary-body");
const summaryStatus = document.getElementById("summary-status");

const monthPrevBtn = document.getElementById("month-prev");
const monthNextBtn = document.getElementById("month-next");
const monthLabel = document.getElementById("month-label");
const studentDetailContent = document.getElementById("student-detail-content");

const state = {
  teacherId: null,
  students: [],
  attendanceDate: null,
  attendanceCurrent: {},
  attendanceDraft: {},
  selectedStudentId: null,
  selectedStudentName: "",
  detailMonth: null,
  studentRecords: [],
  teacherName: "",
};

function getCookieValue(name) {
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}`))
    ?.split("=")[1];
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || "Хүсэлт амжилтгүй");
  }
  return data;
}

function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function getLocalDateString(sourceDate = new Date()) {
  const d = new Date(sourceDate);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function getLocalMonthString(sourceDate = new Date()) {
  const d = new Date(sourceDate);
  d.setDate(1);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 7);
}

async function loadTeacherProfile() {
  try {
    const data = await fetchJson(`/teacher/${state.teacherId}/profile`);
    const name = `${data.teacher.firstname} ${data.teacher.lastname}`.trim();
    state.teacherName = name;
    teacherIdBadge.textContent = `Teacher #${state.teacherId} - ${name}`;
  } catch (err) {
    teacherIdBadge.textContent = `Teacher #${state.teacherId}`;
  }
}

function formatMonthLabel(month) {
  const [year, monthStr] = month.split("-");
  const date = new Date(Date.UTC(Number(year), Number(monthStr) - 1, 1));
  return date.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function shiftMonth(month, delta) {
  const [year, monthStr] = month.split("-");
  const base = new Date(
    Date.UTC(Number(year), Number(monthStr) - 1 + delta, 1)
  );
  return `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function updateOverview() {
  const total = state.students.length;
  const marked = Object.values(state.attendanceDraft).filter(Boolean).length;
  const unmarked = Math.max(total - marked, 0);
  statStudents.textContent = total;
  statMarked.textContent = marked;
  statUnmarked.textContent = unmarked;
  rosterCount.textContent = total;
}

function renderStudents(students) {
  studentsList.textContent = "";
  if (!students.length) {
    const placeholder = document.createElement("li");
    placeholder.textContent = "Сурагчийн лист хоосон байна";
    studentsList.appendChild(placeholder);
    return;
  }

  students.forEach((student) => {
    const li = document.createElement("li");
    li.className = "list-row";
    li.dataset.studentId = student.id;
    if (String(student.id) === String(state.selectedStudentId)) {
      li.classList.add("active");
    }

    const info = document.createElement("div");
    info.innerHTML = `<strong>${student.firstname} ${
      student.lastname
    }</strong> <span class="muted">#${student.id}${
      student.age ? " | " + student.age + " yrs " : ""
    }</span>`;

    const actions = document.createElement("div");
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.dataset.deleteStudent = student.id;
    removeBtn.textContent = "Хасах";
    actions.appendChild(removeBtn);

    li.appendChild(info);
    li.appendChild(actions);
    studentsList.appendChild(li);
  });
}

async function loadStudents(searchText = "") {
  studentsList.textContent = "Сурагчдын листийн ачаалж байна";
  try {
    const params = searchText
      ? `?search=${encodeURIComponent(searchText)}`
      : "";
    const data = await fetchJson(
      `/teacher/${state.teacherId}/students${params}`
    );
    state.students = data;
    renderStudents(data);
    updateOverview();

    if (state.selectedStudentId) {
      const stillExists = data.some(
        (s) => String(s.id) === String(state.selectedStudentId)
      );
      if (!stillExists) {
        state.selectedStudentId = null;
        state.selectedStudentName = "";
        state.studentRecords = [];
      }
    }
    renderStudentDetail();
  } catch (err) {
    studentsList.textContent =
      err.message || "Сурагчдын лист дуудахад алдаа гарлаа";
  }
}

function renderAttendanceTable() {
  attendanceTableBody.textContent = "";
  if (!state.students.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = "Сурагчдийн лист хоосон байна";
    row.appendChild(cell);
    attendanceTableBody.appendChild(row);
    return;
  }

  state.students.forEach((student) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = `${student.firstname} ${student.lastname}`;
    const idCell = document.createElement("td");
    idCell.textContent = student.id;
    const statusCell = document.createElement("td");

    ["present", "absent", "excused"].forEach((value) => {
      const label = document.createElement("label");
      label.className = "radio";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `att-${student.id}`;
      input.value = value;
      input.dataset.studentId = student.id;
      input.checked = state.attendanceDraft[student.id] === value;
      input.addEventListener("change", () => {
        state.attendanceDraft[student.id] = value;
        updateOverview();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(value));
      statusCell.appendChild(label);
    });

    row.appendChild(nameCell);
    row.appendChild(idCell);
    row.appendChild(statusCell);
    attendanceTableBody.appendChild(row);
  });
}

async function loadAttendance() {
  attendanceStatus.textContent = "Ирцийг оруулж байна...";
  const targetDate = attendanceDateInput.value || state.attendanceDate;
  state.attendanceDate = targetDate;
  attendanceDateInput.value = targetDate;

  try {
    const data = await fetchJson(
      `/teacher/${state.teacherId}/attendance?date=${encodeURIComponent(
        targetDate
      )}`
    );
    state.attendanceCurrent = {};
    data.forEach((record) => {
      state.attendanceCurrent[record.id] = record.attendance;
    });
    state.attendanceDraft = { ...state.attendanceCurrent };
    renderAttendanceTable();
    attendanceStatus.textContent = data.length
      ? `${targetDate} - ийн ирцийг хадгаллаа`
      : "Ирц хадгалаагүй байна";
    updateOverview();
  } catch (err) {
    attendanceStatus.textContent =
      err.message || "Ирцийг хадгалах боломжгүй байна";
  }
}

function getDirtyAttendance() {
  const dirty = [];
  state.students.forEach((student) => {
    const current = state.attendanceCurrent[student.id];
    const draft = state.attendanceDraft[student.id];
    if (draft && draft !== current) {
      dirty.push({ studentId: student.id, value: draft });
    }
  });
  return dirty;
}

async function saveAttendance() {
  const dirty = getDirtyAttendance();
  if (!dirty.length) {
    attendanceStatus.textContent = "Хадгалах өөрчлөлт олдсонгүй";
    return;
  }

  saveAttendanceBtn.disabled = true;
  attendanceStatus.textContent = "Хадгалж байна...";
  try {
    await Promise.all(
      dirty.map((item) =>
        fetchJson(`/teacher/${state.teacherId}/attendance`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: item.studentId,
            date: state.attendanceDate,
            attendance: item.value,
          }),
        })
      )
    );
    dirty.forEach((item) => {
      state.attendanceCurrent[item.studentId] = item.value;
    });
    attendanceStatus.textContent = `${
      dirty.length
    } өөрчлөлт ${new Date().toLocaleDateString()} хадгаллаа.`;
  } catch (err) {
    attendanceStatus.textContent = err.message || "Ирцийг хадгалалт амжилтгүй";
  } finally {
    saveAttendanceBtn.disabled = false;
    updateOverview();
  }
}

async function loadSummary() {
  summaryStatus.textContent = "Ирцийн хураангуйг ачаалж байна";
  summaryBody.textContent = "";
  try {
    const sort = summarySort.value;
    const data = await fetchJson(
      `/teacher/${state.teacherId}/summary${
        sort ? `?sort=${encodeURIComponent(sort)}` : ""
      }`
    );

    if (!data.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.textContent = "Ирцийн хураангуй одоогоор хоосон байна";
      row.appendChild(cell);
      summaryBody.appendChild(row);
      summaryStatus.textContent = "";
      return;
    }

    data.forEach((item) => {
      const row = document.createElement("tr");
      const presentPercent =
        item.present_percent !== null
          ? Number(item.present_percent).toFixed(1)
          : "0.0";
      row.innerHTML = `
        <td>${item.firstname} ${item.lastname}</td>
        <td>${presentPercent}%</td>
        <td>${item.present_count}</td>
        <td>${item.absent_count}</td>
        <td>${item.excused_count}</td>
        <td>${item.total_days}</td>
      `;
      summaryBody.appendChild(row);
    });
    summaryStatus.textContent = "";
  } catch (err) {
    summaryStatus.textContent =
      err.message || "Ирцийн хураангуйг харуулахад алдаа гарлаа";
  }
}

async function handleAddStudent(event) {
  event.preventDefault();
  addStudentStatus.textContent = "Сурагчийг хадгалж байна...";

  const payload = {
    firstname: addStudentForm.firstname.value.trim(),
    lastname: addStudentForm.lastname.value.trim(),
    age: addStudentForm.age.value ? Number(addStudentForm.age.value) : null,
    password: addStudentForm.password.value,
  };

  try {
    const data = await fetchJson(`/teacher/${state.teacherId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    addStudentStatus.textContent = `${data.id} ID - тай сурагчийг бүртгэж авлаа.`;
    addStudentForm.reset();
    await loadStudents(studentSearch.value.trim());
    await loadAttendance();
    await loadSummary();
  } catch (err) {
    addStudentStatus.textContent =
      err.message || "Сурагчийг бүртгэхэд алдаа гарлаа";
  }
}

async function handleDeleteStudent(studentId, target) {
  if (!confirm("Сурагчийг хасах уу?")) return;

  target.disabled = true;
  target.textContent = "Сурагчийг хасаж байна.";
  try {
    await fetchJson(`/teacher/${state.teacherId}/students/${studentId}`, {
      method: "DELETE",
    });
    if (String(state.selectedStudentId) === String(studentId)) {
      state.selectedStudentId = null;
      state.selectedStudentName = "";
      state.studentRecords = [];
    }
    await loadStudents(studentSearch.value.trim());
    await loadAttendance();
    await loadSummary();
  } catch (err) {
    target.textContent = err.message || "Хасахад алдаа гарлаа";
  } finally {
    target.disabled = false;
  }
}

function renderStudentDetail(errorText) {
  if (!state.detailMonth) {
    state.detailMonth = getLocalMonthString();
  }
  monthLabel.textContent = formatMonthLabel(state.detailMonth);

  if (errorText) {
    studentDetailContent.classList.add("muted");
    studentDetailContent.textContent = errorText;
    return;
  }

  if (!state.selectedStudentId) {
    studentDetailContent.classList.add("muted");
    studentDetailContent.textContent =
      "Сурагчийн нэрэн дээр дарж ирцийг харна уу";
    return;
  }

  studentDetailContent.classList.remove("muted");
  const recordsMap = {};
  const counts = { present: 0, absent: 0, excused: 0 };
  state.studentRecords.forEach((rec) => {
    const dayKey =
      typeof rec.date === "string"
        ? rec.date.slice(0, 10)
        : new Date(rec.date).toISOString().slice(0, 10);
    const status = (rec.attendance || "").toLowerCase();
    recordsMap[dayKey] = status;
    if (counts[status] !== undefined) counts[status] += 1;
  });

  const [yearStr, monthStr] = state.detailMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offset = firstDay.getUTCDay();

  const header = document.createElement("div");
  header.className = "student-detail-head";
  header.innerHTML = `<strong>${state.selectedStudentName}</strong> <span class="muted">#${state.selectedStudentId}</span>`;

  const totalMarked = counts.present + counts.absent + counts.excused;
  const presentPct = totalMarked
    ? ((counts.present / totalMarked) * 100).toFixed(1)
    : "0.0";

  const summary = document.createElement("div");
  summary.className = "stat-grid";
  summary.innerHTML = `
    <div class="stat-card"><p class="muted">Суусан</p><strong>${counts.present}</strong></div>
    <div class="stat-card"><p class="muted">Тасалсан</p><strong>${counts.absent}</strong></div>
    <div class="stat-card"><p class="muted">Чөлөөтэй</p><strong>${counts.excused}</strong></div>
    <div class="stat-card"><p class="muted">Суусан %</p><strong>${presentPct}%</strong></div>
  `;

  const legend = document.createElement("div");
  legend.className = "legend";
  legend.innerHTML = `
    <span class="legend-item present">Суусан</span>
    <span class="legend-item absent">Тасалсан</span>
    <span class="legend-item excused">Чөлөөтэй</span>
    <span class="legend-item empty">Хоосон</span>
  `;

  const weekdays = document.createElement("div");
  weekdays.className = "calendar-weekdays";
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
    const cell = document.createElement("div");
    cell.textContent = d;
    weekdays.appendChild(cell);
  });

  const grid = document.createElement("div");
  grid.className = "calendar-grid";
  for (let i = 0; i < offset; i += 1) {
    const cell = document.createElement("div");
    cell.className = "calendar-day empty";
    grid.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateStr = `${yearStr}-${monthStr}-${String(day).padStart(2, "0")}`;
    const status = recordsMap[dateStr];
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    if (status) {
      cell.classList.add(status);
    }

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = day;
    cell.appendChild(number);

    if (status) {
      const badge = document.createElement("span");
      badge.className = "day-status";
      badge.textContent = status;
      cell.appendChild(badge);
    }

    grid.appendChild(cell);
  }

  const calendar = document.createElement("div");
  calendar.className = "calendar";
  calendar.appendChild(weekdays);
  calendar.appendChild(grid);

  studentDetailContent.innerHTML = "";
  studentDetailContent.appendChild(header);
  studentDetailContent.appendChild(summary);
  studentDetailContent.appendChild(legend);
  studentDetailContent.appendChild(calendar);
}

async function loadStudentHistory() {
  if (!state.selectedStudentId) return;
  studentDetailContent.classList.add("muted");
  studentDetailContent.textContent = "Календар ачаалж байна";
  monthLabel.textContent = formatMonthLabel(state.detailMonth);

  try {
    const data = await fetchJson(
      `/teacher/${state.teacherId}/students/${state.selectedStudentId}/attendance-history?month=${state.detailMonth}`
    );
    state.detailMonth = data.month;
    state.studentRecords = data.records || [];
    renderStudentDetail();
  } catch (err) {
    renderStudentDetail(err.message || "Календар ачаалахад алдаа гарлаа");
  }
}

function setSelectedStudent(studentId) {
  const student = state.students.find(
    (s) => String(s.id) === String(studentId)
  );
  if (!student) return;
  state.selectedStudentId = student.id;
  state.selectedStudentName = `${student.firstname} ${student.lastname}`;
  state.detailMonth = getLocalMonthString();
  state.studentRecords = [];
  renderStudents(state.students);
  renderStudentDetail();
  loadStudentHistory();
}

function wireUpRoster() {
  toggleAddStudentBtn.addEventListener("click", () => {
    addStudentForm.classList.toggle("hidden");
  });

  addStudentForm.addEventListener("submit", handleAddStudent);

  studentSearch.addEventListener(
    "input",
    debounce((event) => {
      loadStudents(event.target.value.trim());
    }, 400)
  );

  studentsList.addEventListener("click", (event) => {
    const studentId = event.target.dataset.deleteStudent;
    if (studentId) {
      handleDeleteStudent(studentId, event.target);
      return;
    }

    const row = event.target.closest("[data-student-id]");
    if (row) {
      setSelectedStudent(row.dataset.studentId);
    }
  });
}

function wireUpAttendance() {
  reloadAttendanceBtn.addEventListener("click", loadAttendance);
  saveAttendanceBtn.addEventListener("click", saveAttendance);

  attendanceDateInput.addEventListener("change", async () => {
    const nextDate = attendanceDateInput.value;
    if (!nextDate || nextDate === state.attendanceDate) return;

    const dirty = getDirtyAttendance();
    if (dirty.length) {
      const discard = confirm(
        `${state.attendanceDate} -д хадгалаагүй өөрчлөлт байна. Орхиод ${nextDate} очих уу?`
      );
      if (!discard) {
        attendanceDateInput.value = state.attendanceDate;
        return;
      }
    }

    await loadAttendance();
  });
}

function wireUpSummary() {
  loadSummaryBtn.addEventListener("click", loadSummary);
  summarySort.addEventListener("change", loadSummary);
}

function wireUpStudentDetail() {
  monthPrevBtn.addEventListener("click", () => {
    state.detailMonth = shiftMonth(state.detailMonth, -1);
    renderStudentDetail();
    if (state.selectedStudentId) loadStudentHistory();
  });
  monthNextBtn.addEventListener("click", () => {
    state.detailMonth = shiftMonth(state.detailMonth, 1);
    renderStudentDetail();
    if (state.selectedStudentId) loadStudentHistory();
  });
}

async function init() {
  // Ensure default date/month are localized before rendering anything.
  state.attendanceDate = state.attendanceDate || getLocalDateString();
  state.detailMonth = state.detailMonth || getLocalMonthString();

  const teacherId = getCookieValue("teacherId");
  if (!teacherId) {
    overviewStatus.textContent = "Эхлээд багшаар нэвтэрнэ үү";
    attendanceStatus.textContent = "Нэвтэрсэн байх шаардлагатай";
    summaryStatus.textContent = "Нэвтэрсэн байх шаардлагатай";
    renderStudentDetail();
    return;
  }

  state.teacherId = teacherId;
  state.attendanceDate = getLocalDateString();
  state.detailMonth = getLocalMonthString();
  headerDate.textContent = new Date().toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  attendanceDateInput.value = state.attendanceDate;
  monthLabel.textContent = formatMonthLabel(state.detailMonth);

  wireUpRoster();
  wireUpAttendance();
  wireUpSummary();
  wireUpStudentDetail();

  await loadTeacherProfile();
  await loadStudents();
  await loadAttendance();
  await loadSummary();
}

init();
