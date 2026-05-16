/* ------------------------------------------------------------------ */
/* parallel-laws.js                                                     */
/* Place at: docs/javascripts/parallel-laws.js                         */
/* Register in mkdocs.yml under extra_javascript (after Chart.js)      */
/*                                                                      */
/* Chart.js must be listed first in extra_javascript:                   */
/*   - https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js */
/*   - javascripts/parallel-laws.js                                     */
/* ------------------------------------------------------------------ */

(function () {
  "use strict";

  /* ---- colour constants (fixed — not theme-dependent) ------------ */
  const C_AMDAHL     = "#534AB7";   /* purple-600  */
  const C_GUSTAFSON  = "#1D9E75";   /* teal-400    */
  const C_LIMIT      = "#D85A30";   /* coral-400   */

  /* ---- chart instances (module-level so we can destroy on re-init) */
  let mainChart        = null;
  let sensitivityChart = null;
  let themeObserver    = null;

  /* ---- maths ----------------------------------------------------- */
  function amdahl(s, p)    { return 1 / (s + (1 - s) / p); }
  function gustafson(s, p) { return p - s * (p - 1); }

  function makeLabels(maxP) {
    const step = maxP <= 32 ? 2 : maxP <= 64 ? 4 : 8;
    const pts = [];
    for (let p = 1; p <= maxP; p += step) pts.push(p);
    if (pts[pts.length - 1] !== maxP) pts.push(maxP);
    return pts;
  }

  /* ---- theme helpers --------------------------------------------- */
  function isDark() {
    return document.body.getAttribute("data-md-color-scheme") === "slate";
  }

  function chartTheme() {
    return {
      grid: isDark() ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
      tick: isDark() ? "rgba(255,255,255,0.5)"  : "rgba(0,0,0,0.5)",
    };
  }

  /* ---- update chart axis colours when theme changes -------------- */
  function applyTheme() {
    if (!mainChart) return;
    const { grid, tick } = chartTheme();
    [mainChart, sensitivityChart].forEach((chart) => {
      ["x", "y"].forEach((axis) => {
        chart.options.scales[axis].grid.color        = grid;
        chart.options.scales[axis].ticks.color       = tick;
        if (chart.options.scales[axis].title) {
          chart.options.scales[axis].title.color     = tick;
        }
      });
      chart.update("none");
    });
  }

  /* ---- build a base axis config ---------------------------------- */
  function axis(title, { grid, tick }) {
    return {
      grid:  { color: grid },
      ticks: { color: tick, callback: (v) => v + "×" },
      title: { display: !!title, text: title, color: tick, font: { size: 12 } },
      min: 0,
    };
  }

  /* ---- initialise both Chart.js instances ------------------------ */
  function init() {
    const mainCanvas = document.getElementById("pl-main-chart");
    if (!mainCanvas) return;          /* not on this page — bail out */

    /* destroy stale instances (instant navigation re-runs init) */
    if (mainChart)        { mainChart.destroy();        mainChart = null; }
    if (sensitivityChart) { sensitivityChart.destroy(); sensitivityChart = null; }
    if (themeObserver)    { themeObserver.disconnect(); themeObserver = null; }

    const sensCanvas    = document.getElementById("pl-sensitivity-chart");
    const serialSlider  = document.getElementById("pl-serial-slider");
    const procSlider    = document.getElementById("pl-proc-slider");
    const { grid, tick } = chartTheme();

    /* --- main speedup chart --------------------------------------- */
    mainChart = new Chart(mainCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Amdahl's law",
            data: [], borderColor: C_AMDAHL,
            borderWidth: 2.5, pointRadius: 0, tension: 0.3,
          },
          {
            label: "Gustafson's law",
            data: [], borderColor: C_GUSTAFSON,
            borderWidth: 2.5, pointRadius: 0, tension: 0.3,
          },
          {
            label: "Amdahl ceiling",
            data: [], borderColor: C_LIMIT,
            borderWidth: 1.5, pointRadius: 0,
            borderDash: [6, 4],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}×`,
            },
          },
        },
        scales: {
          x: { ...axis("Number of processors (p)", { grid, tick }), ticks: { color: tick } },
          y:   axis("Speedup (×)", { grid, tick }),
        },
      },
    });

    /* --- sensitivity chart --------------------------------------- */
    sensitivityChart = new Chart(sensCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Amdahl's law",
            data: [], borderColor: C_AMDAHL,
            borderWidth: 2, pointRadius: 0, tension: 0.3,
          },
          {
            label: "Gustafson's law",
            data: [], borderColor: C_GUSTAFSON,
            borderWidth: 2, pointRadius: 0, tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (ctx) => `s = ${parseFloat(ctx[0].label).toFixed(2)}`,
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}×`,
            },
          },
        },
        scales: {
          x: { ...axis("Serial fraction (s)", { grid, tick }), ticks: { color: tick } },
          y:   axis("Speedup (×)", { grid, tick }),
        },
      },
    });

    /* --- watch for theme toggle ---------------------------------- */
    themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });

    /* --- wire up sliders ---------------------------------------- */
    serialSlider.addEventListener("input", render);
    procSlider.addEventListener("input", render);
    render();
  }

  /* ---- render: update stats + both charts ------------------------ */
  function render() {
    if (!mainChart) return;

    const s    = parseFloat(document.getElementById("pl-serial-slider").value);
    const maxP = parseInt(document.getElementById("pl-proc-slider").value, 10);

    /* display values */
    document.getElementById("pl-serial-out").textContent = s.toFixed(2);
    document.getElementById("pl-proc-out").textContent   = maxP;

    const aAtP = amdahl(s, maxP);
    const gAtP = gustafson(s, maxP);

    document.getElementById("pl-amdahl-limit").textContent    = s === 0 ? "∞" : (1 / s).toFixed(1) + "×";
    document.getElementById("pl-amdahl-at-p").textContent     = aAtP.toFixed(1) + "×";
    document.getElementById("pl-gustafson-at-p").textContent  = gAtP.toFixed(1) + "×";
    document.getElementById("pl-diff").textContent            = (gAtP - aAtP).toFixed(1) + "×";

    /* main chart data */
    const labels = makeLabels(maxP);
    mainChart.data.labels                 = labels;
    mainChart.data.datasets[0].data       = labels.map((p) => +amdahl(s, p).toFixed(3));
    mainChart.data.datasets[1].data       = labels.map((p) => +gustafson(s, p).toFixed(3));
    const ceiling                         = s === 0 ? maxP : +(1 / s).toFixed(3);
    mainChart.data.datasets[2].data       = labels.map(() => ceiling);
    mainChart.update();

    /* sensitivity chart data */
    const sVals = Array.from({ length: 20 }, (_, i) => +(i * 0.05).toFixed(2));
    sensitivityChart.data.labels          = sVals.map((v) => v.toFixed(2));
    sensitivityChart.data.datasets[0].data = sVals.map((sv) => +amdahl(sv, maxP).toFixed(3));
    sensitivityChart.data.datasets[1].data = sVals.map((sv) => +gustafson(sv, maxP).toFixed(3));
    sensitivityChart.update();
  }

  /* ---- boot: support both instant navigation and normal load ----- */
  /*                                                                   */
  /* MkDocs Material with navigation.instant exposes `document$`      */
  /* (an RxJS Subject) that fires on every page navigation. Without   */
  /* instant loading, a plain DOMContentLoaded is sufficient.         */
  /* ----------------------------------------------------------------- */
  if (typeof document$ !== "undefined") {
    /* instant navigation — fires on every page swap */
    document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
