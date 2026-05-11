// This is to server the mini-status update to docs/index.md card under HPC support documentation
document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("kp-status-ep6");
  if (!panel) return;

  // Point this at your existing status JSON
  fetch("/kir-researchcomp-hub/status/current.json")
    .then(r => r.json())
    .then(data => {
      // Expects: { services: [ { name: "GPFS", status: "ok" }, ... ] }
      const services = data.services;  //remove the original slice in favour of show all
      const allOk    = services.every(s => s.status === "operational");
      const anyDown  = services.some(s => s.status === "degraded" || s.status === "down");
      const anyMaint = services.some(s => s.status === "maintenance");
          
      const label = allOk     ? "All systems operational" :
                    anyDown   ? "Service disruption"       :
                    anyMaint  ? "Scheduled maintenance"    :
                                "Some services affected";
      const allOk = services.every(s => s.status === "ok");

      panel.innerHTML = services.map(s => `
        <span class="kp-status-dot kp-dot--${s.status}" title="${s.name}: ${s.status}"></span>
      `).join("") + `
        <span class="kp-status-label">
          ${allOk ? "All systems operational" : "Some services affected"}
        </span>`;
    })
    .catch(() => {
      panel.innerHTML = `
        <span class="kp-status-dot kp-dot--unknown"></span>
        <span class="kp-status-label">Status unavailable</span>`;
    });
});