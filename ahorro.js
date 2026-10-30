/* Plan de ahorro Barcelona: los datos se guardan en este navegador. */
(() => {
  if (!document.querySelector('#saving-settings')) return;
  const KEY = "barcelona-ahorro-v1";
  const defaults = { goal: 50000, targetDate: "2027-02-01", movements: [] };
  let state;
  try { state = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { state = { ...defaults }; }
  const $ = (s) => document.querySelector(s);
  const money = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const total = () => state.movements.reduce((sum, m) => sum + (m.type === "deposito" ? m.amount : -m.amount), 0);
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

  function render() {
    const saved = total();
    const remaining = Math.max(0, state.goal - saved);
    const progress = state.goal > 0 ? Math.min(100, Math.max(0, saved / state.goal * 100)) : 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(state.targetDate + "T00:00:00");
    const days = Math.max(1, Math.ceil((target - today) / 86400000));
    const weeks = Math.max(1, days / 7);
    $("#saving-goal").value = state.goal;
    $("#saving-date").value = state.targetDate;
    $("#saving-total").textContent = money(saved);
    $("#saving-remaining").textContent = money(remaining);
    $("#saving-progress").textContent = Math.round(progress) + "%";
    $("#saving-bar").style.width = progress + "%";
    $("#saving-monthly").textContent = money(remaining / Math.max(1, days / 30.4375));
    $("#saving-weekly").textContent = money(remaining / weeks);
    $("#saving-days").textContent = days + (days === 1 ? " día restante" : " días restantes");
    $("#saving-movements").innerHTML = state.movements.length
      ? [...state.movements].sort((a,b) => b.date.localeCompare(a.date)).map(m => `<article class="saving-movement"><div><strong>${m.type === "deposito" ? "＋" : "−"} ${money(m.amount)}</strong><small>${escapeHtml(m.note || (m.type === "deposito" ? "Ahorro" : "Retiro"))} · ${escapeHtml(m.date)}</small></div><button type="button" class="delete-movement" data-id="${m.id}" aria-label="Eliminar movimiento">Eliminar</button></article>`).join("")
      : '<p class="saving-empty">Todavía no hay movimientos. Registra tu primer ahorro para comenzar. ♡</p>';
  }

  $("#saving-settings").addEventListener("submit", e => {
    e.preventDefault();
    const goal = Number($("#saving-goal").value);
    const date = $("#saving-date").value;
    if (!Number.isFinite(goal) || goal <= 0 || !date) return;
    state.goal = goal; state.targetDate = date; save(); render();
  });
  $("#saving-form").addEventListener("submit", e => {
    e.preventDefault();
    const amount = Number($("#saving-amount").value);
    if (!Number.isFinite(amount) || amount <= 0) return;
    state.movements.push({
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()),
      amount, date: $("#saving-movement-date").value,
      type: $("#saving-type").value, note: $("#saving-note").value.trim()
    });
    save(); e.target.reset(); $("#saving-movement-date").value = new Date().toISOString().slice(0,10); render();
  });
  $("#saving-movements").addEventListener("click", e => {
    const button = e.target.closest("[data-id]");
    if (!button || !confirm("¿Eliminar este movimiento del registro?")) return;
    state.movements = state.movements.filter(m => m.id !== button.dataset.id); save(); render();
  });
  $("#saving-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "mi-plan-ahorro-barcelona.json"; a.click(); URL.revokeObjectURL(url);
  });
  $("#saving-import").addEventListener("change", async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Number.isFinite(imported.goal) || !Array.isArray(imported.movements)) throw new Error("Archivo inválido");
      state = { ...defaults, ...imported }; save(); render(); alert("Respaldo restaurado correctamente.");
    } catch { alert("No se pudo leer el respaldo. Selecciona un archivo JSON exportado desde esta guía."); }
    e.target.value = "";
  });
  $("#saving-movement-date").value = new Date().toISOString().slice(0,10);
  render();
})();