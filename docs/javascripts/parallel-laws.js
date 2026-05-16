/* ------------------------------------------------------------------ */
/* parallel-laws.js                                                     */
/* Place at: docs/javascripts/parallel-laws.js                         */
/*                                                                      */
/* Self-contained — loads Chart.js on demand. No CDN entry needed in   */
/* mkdocs.yml. Only register this file:                                 */
/*                                                                      */
/*   extra_javascript:                                                  */
/*     - path: javascripts/parallel-laws.js                            */
/*       defer: true                                                    */
/* ------------------------------------------------------------------ */

(function () {
  "use strict";

  var CHARTJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";

  var C_AMDAHL    = "#534AB7";
  var C_GUSTAFSON = "#1D9E75";
  var C_LIMIT     = "#D85A30";

  var mainChart        = null;
  var sensitivityChart = null;
  var themeObserver    = null;

  /* ---- maths ----------------------------------------------------- */
  function amdahl(s, p)    { return 1 / (s + (1 - s) / p); }
  function gustafson(s, p) { return p - s * (p - 1); }

  function makeLabels(maxP) {
    var step = maxP <= 32 ? 2 : maxP <= 64 ? 4 : 8;
    var pts  = [];
    for (var p = 1; p <= maxP; p += step) { pts.push(p); }
    if (pts[pts.length - 1] !== maxP) { pts.push(maxP); }
    return pts;
  }

  /* ---- theme ----------------------------------------------------- */
  function isDark() {
    return document.body.getAttribute("data-md-color-scheme") === "slate";
  }

  function chartColors() {
    return {
      grid: isDark() ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
      tick: isDark() ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)",
    };
  }

  function applyTheme() {
    if (!mainChart) { return; }
    var c = chartColors();
    [mainChart, sensitivityChart].forEach(function (chart) {
      Object.values(chart.options.scales).forEach(function (scale) {
        scale.grid.color  = c.grid;
        scale.ticks.color = c.tick;
        if (scale.title) { scale.title.color = c.tick; }
      });
      chart.update("none");
    });
  }

  /* ---- dynamic Chart.js loader ----------------------------------- */
  function loadChartJs(cb) {
    if (window.Chart) { cb(); return; }
    var s    = document.createElement("script");
    s.src    = CHARTJS_CDN;
    s.onload = cb;
    s.onerror = function () {
      console.error("parallel-laws.js: failed to load Chart.js from CDN");
    };
    document.head.appendChild(s);
  }

  /* ---- render ---------------------------------------------------- */
  function render() {
    if (!mainChart) { return; }

    var s    = parseFloat(document.getElementById("pl-serial-slider").value);
    var maxP = parseInt(document.getElementById("pl-proc-slider").value, 10);

    document.getElementById("pl-serial-out").textContent = s.toFixed(2);
    document.getElementById("pl-proc-out").textContent   = String(maxP);

    var aAtP = amdahl(s, maxP);
    var gAtP = gustafson(s, maxP);

    document.getElementById("pl-amdahl-limit").textContent   = s === 0 ? "\u221e" : (1 / s).toFixed(1) + "\u00d7";
    document.getElementById("pl-amdahl-at-p").textContent    = aAtP.toFixed(1) + "\u00d7";
    document.getElementById("pl-gustafson-at-p").textContent = gAtP.toFixed(1) + "\u00d7";
    document.getElementById("pl-diff").textContent           = (gAtP - aAtP).toFixed(1) + "\u00d7";

    var labels  = makeLabels(maxP);
    var ceiling = s === 0 ? maxP : parseFloat((1 / s).toFixed(3));

    mainChart.data.labels           = labels;
    mainChart.data.datasets[0].data = labels.map(function (p) { return parseFloat(amdahl(s, p).toFixed(3)); });
    mainChart.data.datasets[1].data = labels.map(function (p) { return parseFloat(gustafson(s, p).toFixed(3)); });
    mainChart.data.datasets[2].data = labels.map(function ()  { return ceiling; });
    mainChart.update();

    var sVals = [];
    for (var i = 0; i < 20; i++) { sVals.push(parseFloat((i * 0.05).toFixed(2))); }
    sensitivityChart.data.labels           = sVals.map(function (v)  { return v.toFixed(2); });
    sensitivityChart.data.datasets[0].data = sVals.map(function (sv) { return parseFloat(amdahl(sv, maxP).toFixed(3)); });
    sensitivityChart.data.datasets[1].data = sVals.map(function (sv) { return parseFloat(gustafson(sv, maxP).toFixed(3)); });
    sensitivityChart.update();
  }

  /* ---- setup charts (called once Chart.js is confirmed ready) ---- */
  function setupCharts() {
    if (mainChart)        { mainChart.destroy();        mainChart = null; }
    if (sensitivityChart) { sensitivityChart.destroy(); sensitivityChart = null; }
    if (themeObserver)    { themeObserver.disconnect(); themeObserver = null; }

    var mainCanvas = document.getElementById("pl-main-chart");
    var sensCanvas = document.getElementById("pl-sensitivity-chart");
    var c          = chartColors();
    var Ch         = window.Chart;

    mainChart = new Ch(mainCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Amdahl's law",
            data: [], borderColor: C_AMDAHL, backgroundColor: "transparent",
            borderWidth: 2.5, pointRadius: 0, tension: 0.3,
          },
          {
            label: "Gustafson's law",
            data: [], borderColor: C_GUSTAFSON, backgroundColor: "transparent",
            borderWidth: 2.5, pointRadius: 0, tension: 0.3,
          },
          {
            label: "Amdahl ceiling",
            data: [], borderColor: C_LIMIT, backgroundColor: "transparent",
            borderWidth: 1.5, pointRadius: 0, borderDash: [6, 4],
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
              label: function (ctx) {
                return ctx.dataset.label + ": " + ctx.parsed.y.toFixed(2) + "\u00d7";
              },
            },
          },
        },
        scales: {
          x: {
            grid:  { color: c.grid },
            ticks: { color: c.tick },
            title: { display: true, text: "Number of processors (p)", color: c.tick, font: { size: 12 } },
          },
          y: {
            grid:  { color: c.grid },
            ticks: { color: c.tick, callback: function (v) { return v + "\u00d7"; } },
            title: { display: true, text: "Speedup", color: c.tick, font: { size: 12 } },
            min: 0,
          },
        },
      },
    });

    sensitivityChart = new Ch(sensCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Amdahl's law",
            data: [], borderColor: C_AMDAHL, backgroundColor: "transparent",
            borderWidth: 2, pointRadius: 0, tension: 0.3,
          },
          {
            label: "Gustafson's law",
            data: [], borderColor: C_GUSTAFSON, backgroundColor: "transparent",
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
              title: function (ctx) { return "s = " + parseFloat(ctx[0].label).toFixed(2); },
              label: function (ctx) { return ctx.dataset.label + ": " + ctx.parsed.y.toFixed(2) + "\u00d7"; },
            },
          },
        },
        scales: {
          x: {
            grid:  { color: c.grid },
            ticks: { color: c.tick },
            title: { display: true, text: "Serial fraction (s)", color: c.tick, font: { size: 12 } },
          },
          y: {
            grid:  { color: c.grid },
            ticks: { color: c.tick, callback: function (v) { return v + "\u00d7"; } },
            title: { display: true, text: "Speedup", color: c.tick, font: { size: 12 } },
            min: 0,
          },
        },
      },
    });

    themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });

    document.getElementById("pl-serial-slider").addEventListener("input", render);
    document.getElementById("pl-proc-slider").addEventListener("input", render);

    render();
  }

  /* ---- init: guard on canvas presence, then load Chart.js ------- */
  function init() {
    if (!document.getElementById("pl-main-chart")) { return; }
    loadChartJs(setupCharts);
  }

  /* ---- boot ------------------------------------------------------ */
  if (typeof document$ !== "undefined") {
    document$.subscribe(init);
  } else {
    init();
  }

}());
