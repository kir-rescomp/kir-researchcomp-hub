document$.subscribe(() => {
  const panel = document.getElementById('kp-status-ep6');
  if (!panel) return;

  fetch("/kir-researchcomp-hub/status/current.json")
    .then(r => r.json())
    .then(data => {
      const services = data.services;
      const allOk   = services.every(s => s.status === "operational");
      const anyDown  = services.some(s => s.status === "degraded" || s.status === "down");
      const anyMaint = services.some(s => s.status === "maintenance");

      const label = allOk    ? "All systems operational" :
                    anyDown  ? "Service disruption"      :
                    anyMaint ? "Scheduled maintenance"   :
                               "Some services affected";

      panel.innerHTML = services.map(s => `
        <span class="kp-status-dot kp-dot--${s.status}" title="${s.name}: ${s.status}"></span>
      `).join("") 
    })
    .catch(() => {
      panel.innerHTML = `
        <span class="kp-status-dot kp-dot--unknown"></span>
        <span class="kp-status-label">Status unavailable</span>`;
    });
});