// This is to server the mini-status update to docs/index.md card under HPC support documentation
document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("kp-status-ep6");
  if (!panel) return;

  // Point this at your existing status JSON
  fetch("/kir-researchcomp-hub/status/current.json")
    .then(r => r.json())
    .then(data => {
      // Expects: { services: [ { name: "GPFS", status: "ok" }, ... ] }
      const services = data.services.slice(0, 5); // show up to 5 dots
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