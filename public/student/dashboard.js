const headerDate = document.getElementById("header-date");
const studentBadge = document.getElementById("student-badge");
const monthPrevBtn = document.getElementById("month-prev");
const monthNextBtn = document.getElementById("month-next");
const monthLabel = document.getElementById("month-label");
const calendarStatus = document.getElementById("calendar-status");
const calendarContent = document.getElementById("calendar-content");
const statPresent = document.getElementById("stat-present");
const statAbsent = document.getElementById("stat-absent");
const statExcused = document.getElementById("stat-excused");
const statPresentPercent = document.getElementById("stat-present-percent");

const passwordForm = document.getElementById("password-form");
const passwordStatus = document.getElementById("password-status");

const state = {
  studentId: null,
  detailMonth: new Date().toISOString().slice(0, 7),
  records: [],
  studentName: "",
};

function getCookieValue(name) {
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
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

async function loadStudentProfile() {
  try {
    const data = await fetchJson(`/student/${state.studentId}/profile`);
    const name = `${data.student.firstname} ${data.student.lastname}`.trim();
    state.studentName = name;
    studentBadge.textContent = `Student #${state.studentId} - ${name}`;
  } catch (err) {
    studentBadge.textContent = `Student #${state.studentId}`;
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

function renderStats() {
  const counts = { present: 0, absent: 0, excused: 0 };
  state.records.forEach((rec) => {
    const status = (rec.attendance || "").toLowerCase();
    if (counts[status] !== undefined) counts[status] += 1;
  });
  const totalMarked = counts.present + counts.absent + counts.excused;
  const presentPct = totalMarked
    ? ((counts.present / totalMarked) * 100).toFixed(1)
    : "0.0";

  statPresent.textContent = counts.present;
  statAbsent.textContent = counts.absent;
  statExcused.textContent = counts.excused;
  statPresentPercent.textContent = `${presentPct}%`;
}

function renderCalendar() {
  monthLabel.textContent = formatMonthLabel(state.detailMonth);

  const recordsMap = {};
  state.records.forEach((rec) => {
    const key =
      typeof rec.date === "string"
        ? rec.date.slice(0, 10)
        : new Date(rec.date).toISOString().slice(0, 10);
    recordsMap[key] = (rec.attendance || "").toLowerCase();
  });

  const [yearStr, monthStr] = state.detailMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offset = firstDay.getUTCDay();

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

  calendarContent.innerHTML = "";
  calendarContent.appendChild(weekdays);
  calendarContent.appendChild(grid);
}

async function loadAttendance() {
  if (!state.studentId) return;
  calendarStatus.textContent = "Ирцийг ачаалж байна";
  try {
    const data = await fetchJson(
      `/student/${state.studentId}/attendance?month=${state.detailMonth}`
    );
    state.detailMonth = data.month;
    state.records = data.records || [];
    calendarStatus.textContent = state.records.length
      ? ""
      : "Энэ сард бүртгүүлсэн ирц байхгүй";
    renderCalendar();
    renderStats();
  } catch (err) {
    calendarStatus.textContent =
      err.message || "Ирцийг харуулахад алдаа гарлаа.";
    calendarContent.innerHTML = "";
  }
}

function wireUpCalendar() {
  monthPrevBtn.addEventListener("click", () => {
    state.detailMonth = shiftMonth(state.detailMonth, -1);
    renderCalendar();
    loadAttendance();
  });
  monthNextBtn.addEventListener("click", () => {
    state.detailMonth = shiftMonth(state.detailMonth, 1);
    renderCalendar();
    loadAttendance();
  });
}

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const studentId = state.studentId;

  if (!studentId) {
    passwordStatus.textContent = "Нэвтэрч орсны дараа Нууц үг солино уу";
    return;
  }

  const payload = {
    oldPassword: passwordForm.oldPassword.value,
    newPassword: passwordForm.newPassword.value,
  };

  passwordStatus.textContent = "Нууц үг сольж байна";

  try {
    await fetchJson(`/student/${studentId}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    passwordStatus.textContent = "Нууц үг солигдлоо";
    passwordForm.reset();
  } catch (err) {
    passwordStatus.textContent = err.message || "Нууц үг солиход алдаа гарлаа";
  }
});

async function init() {
  const studentId = getCookieValue("studentId");
  if (!studentId) {
    calendarStatus.textContent = "Эхлээд сурагчаар нэвтэрнэ үү";
    passwordStatus.textContent =
      "Нууц үг солиход нэвтэрч орсон байх шаардлагатай";
    return;
  }
  state.studentId = studentId;
  studentBadge.textContent = `Student #${studentId}`;
  headerDate.textContent = new Date().toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  monthLabel.textContent = formatMonthLabel(state.detailMonth);

  wireUpCalendar();
  await loadStudentProfile();
  await loadAttendance();
}

init();
