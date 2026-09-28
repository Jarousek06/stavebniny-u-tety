// Stavebniny U Tety – otevírací doba, svátky, menu
// Svátky upravujte jen tady: datum (RRRR-MM-DD), popis, a buď "closed", nebo zkrácená doba.
const HOLIDAYS = [
  { d: "2026-01-01", label: "1. 1. (čt) Nový rok", closed: true },
  { d: "2026-04-03", label: "3. 4. (pá) Velký pátek", open: [7, 0, 12, 0] },
  { d: "2026-04-06", label: "6. 4. (po) Velikonoční pondělí", closed: true },
  { d: "2026-05-01", label: "1. 5. (pá) Svátek práce", open: [7, 0, 12, 0] },
  { d: "2026-05-08", label: "8. 5. (pá) Den vítězství", closed: true },
  { d: "2026-07-06", label: "6. 7. (po) Jan Hus", open: [7, 0, 12, 0] },
  { d: "2026-09-28", label: "28. 9. (po) sv. Václav", closed: true },
  { d: "2026-10-28", label: "28. 10. (st) Den vzniku ČSR", closed: true },
  { d: "2026-11-17", label: "17. 11. (út) Den boje za svobodu", open: [7, 0, 12, 0] },
  { d: "2026-12-24", label: "24. 12. (čt) Štědrý den", closed: true },
  { d: "2026-12-25", label: "25. 12. (pá) 1. svátek vánoční", closed: true },
  { d: "2026-12-26", label: "26. 12. (so) 2. svátek vánoční", closed: true },
  { d: "2026-12-31", label: "31. 12. (čt) Silvestr", closed: true },
  { d: "2027-01-01", label: "1. 1. 2027 (pá) Nový rok", closed: true },
];

// Běžná otevírací doba: [od h, od min, do h, do min], index = den v týdnu (0 = neděle)
const WEEK = [null, [6, 30, 17, 0], [6, 30, 17, 0], [6, 30, 17, 0], [6, 30, 17, 0], [6, 30, 17, 0], [7, 0, 12, 0]];
const DAY_ACC = ["v neděli", "v pondělí", "v úterý", "ve středu", "ve čtvrtek", "v pátek", "v sobotu"];

const fmt = (h, m) => `${h}:${String(m).padStart(2, "0")}`;
const range = (r) => `${fmt(r[0], r[1])} – ${fmt(r[2], r[3])}`;

// Aktuální čas v Česku (i když návštěvník je jinde)
function pragueNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date()).map((x) => [x.type, x.value])
  );
  const iso = `${p.year}-${p.month}-${p.day}`;
  const dow = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return { iso, dow, mins: +p.hour * 60 + +p.minute };
}

function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return { iso: d.toISOString().slice(0, 10), dow: d.getUTCDay() };
}

function hoursFor(iso, dow) {
  const h = HOLIDAYS.find((x) => x.d === iso);
  if (h) return { r: h.closed ? null : [h.open[0], h.open[1], h.open[2], h.open[3]], holiday: h };
  return { r: WEEK[dow], holiday: null };
}

function render() {
  const now = pragueNow();
  const today = hoursFor(now.iso, now.dow);
  const r = today.r;
  const openNow = r && now.mins >= r[0] * 60 + r[1] && now.mins < r[2] * 60 + r[3];

  // Kdy příště otevíráme
  let next = null;
  if (r && now.mins < r[0] * 60 + r[1]) next = { when: "dnes", r };
  else for (let i = 1; i <= 10 && !next; i++) {
    const d = addDays(now.iso, i);
    const x = hoursFor(d.iso, d.dow);
    if (x.r) next = { when: i === 1 ? "zítra" : DAY_ACC[d.dow], r: x.r };
  }

  const status = document.getElementById("status");
  const statusText = document.getElementById("status-text");
  const todayHours = document.getElementById("today-hours");
  const todayNote = document.getElementById("today-note");

  status.classList.add(openNow ? "is-open" : "is-closed");
  todayHours.textContent = r ? range(r) : "Zavřeno";

  if (openNow) {
    const left = r[2] * 60 + r[3] - now.mins;
    const txt = `Právě otevřeno – zavíráme v ${fmt(r[2], r[3])}`;
    statusText.textContent = txt;
    todayNote.textContent = left <= 60 ? `Pozor, zavíráme za ${left} min.` : "● Právě máme otevřeno";
    todayNote.className = "today-note is-open";
  } else {
    const txt = next ? `Teď zavřeno – otevíráme ${next.when} v ${fmt(next.r[0], next.r[1])}` : "Teď zavřeno";
    statusText.textContent = txt;
    todayNote.textContent = next ? `● Otevíráme ${next.when} v ${fmt(next.r[0], next.r[1])}` : "● Teď zavřeno";
    todayNote.className = "today-note is-closed";
  }

  // Upozornění na svátek dnes nebo v příštích 7 dnech
  const alertBox = document.getElementById("today-alert");
  const soon = HOLIDAYS.find((h) => h.d >= now.iso && h.d <= addDays(now.iso, 7).iso);
  if (soon) {
    const isToday = soon.d === now.iso;
    alertBox.innerHTML = `<b>${isToday ? "Dnes je svátek" : "Blíží se svátek"}:</b> ${soon.label} – ${soon.closed ? "<b>zavřeno</b>" : "otevřeno " + range(soon.open)}`;
    alertBox.hidden = false;
  }

  // Zvýraznit dnešní řádek v tabulce
  document.querySelectorAll("#hours tr").forEach((tr) => {
    if (tr.dataset.days.split(",").includes(String(now.dow))) tr.classList.add("is-today");
  });

  // Seznam svátků (minulé zašedlé, nejbližší zvýrazněný)
  const list = document.getElementById("holidays");
  let marked = false;
  list.innerHTML = HOLIDAYS.map((h) => {
    let cls = "";
    if (h.d < now.iso) cls = "past";
    else if (!marked) { cls = "next"; marked = true; }
    const val = h.closed ? `<b class="h-closed">zavřeno</b>` : `<b class="h-open">${range(h.open)}</b>`;
    return `<li class="${cls}"><span>${h.label}</span>${val}</li>`;
  }).join("");
}

// Mobilní menu
const btn = document.getElementById("menu-btn");
const nav = document.getElementById("nav");
btn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
});

document.getElementById("year").textContent = new Date().getFullYear();
try { render(); } catch (e) { /* když něco selže, zůstane statický text */ }
