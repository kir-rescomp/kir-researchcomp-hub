---
title: Module Catalogue
description: All software modules available on BMRC, searchable by name and filterable by toolchain era.
hide:
  - toc
---

# Module Catalogue

All software modules available on the BMRC cluster, generated from the Lmod spider cache and
updated automatically twice daily.

!!! tip "Loading a module"
```bash
    module load <Name>/<Version>
    # e.g.
    module load Python/3.11.3-GCCcore-12.3.0
```
    Use `module spider <Name>` on the cluster for full details and dependencies.

<div id="mod-ui">

<input
  id="mod-search"
  type="text"
  placeholder="Search modules… (e.g. Python, STAR, SAMtools, GCC)"
  autocomplete="off"
  spellcheck="false"
/>

<div id="mod-era-filters" class="mod-filter-group">
  <span class="mod-filter-label">Toolchain era:</span>
</div>

<p id="mod-meta"></p>

<div id="mod-table-wrap">
  <table id="mod-table" style="display:none">
    <thead>
      <tr>
        <th style="width:18%">Module</th>
        <th style="width:44%">Versions <span class="mod-hint">(highlighted = default)</span></th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody id="mod-tbody"></tbody>
  </table>
</div>

<p id="mod-status">Loading catalogue…</p>

</div>

<script>
(async () => {
  const INDEX_URL = "../../data/modules.json";

  const searchEl  = document.getElementById("mod-search");
  const eraDiv    = document.getElementById("mod-era-filters");
  const metaEl    = document.getElementById("mod-meta");
  const tbody     = document.getElementById("mod-tbody");
  const statusEl  = document.getElementById("mod-status");
  const tableEl   = document.getElementById("mod-table");

  let data;
  try {
    const resp = await fetch(INDEX_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    data = await resp.json();
  } catch (e) {
    statusEl.textContent = `Could not load module catalogue: ${e.message}`;
    return;
  }

  const generated = new Date(data.generated).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/London"
  });
  statusEl.textContent = `Last updated ${generated} (London time)`;

  // Era filter buttons
  let activeEra = null;
  data.eras.forEach(era => {
    const btn = document.createElement("button");
    btn.className = "mod-era-btn";
    btn.textContent = era;
    btn.addEventListener("click", () => {
      activeEra = activeEra === era ? null : era;
      document.querySelectorAll(".mod-era-btn")
        .forEach(b => b.classList.toggle("active", b.textContent === activeEra));
      render();
    });
    eraDiv.appendChild(btn);
  });

  function render() {
    const words = searchEl.value.toLowerCase().trim().split(/\s+/).filter(Boolean);

    const filtered = data.modules.filter(m => {
      if (activeEra && !m.eras.includes(activeEra)) return false;
      if (!words.length) return true;
      const hay = (m.name + " " + m.description).toLowerCase();
      return words.every(w => hay.includes(w));
    });

    metaEl.textContent =
      `Showing ${filtered.length} of ${data.n_packages} packages` +
      ` (${data.n_versions} total versions)`;

    tbody.innerHTML = filtered.map(m => {
      const pills = m.versions.map(v =>
          `<span class="mod-pill${v.default ? " is-default" : ""}">${v.version}</span>`
      ).join("");

      const nameCell = m.url
        ? `<a href="${m.url}" target="_blank" rel="noopener">${m.name}</a>`
        : m.name;

      return `<tr>
        <td>
          <span class="mod-name">${nameCell}</span>
          <span class="mod-n-ver">${m.n_versions} version${m.n_versions !== 1 ? "s" : ""}</span>
        </td>
        <td><div class="mod-pills">${pills}</div></td>
        <td>${m.description || "—"}</td>
      </tr>`;
    }).join("");

    tableEl.style.display = filtered.length ? "" : "none";
  }

  searchEl.addEventListener("input", render);
  tableEl.style.display = "";
  render();
})();
</script>