document$.subscribe(function () {
  var params = new URLSearchParams(window.location.search);
  var target = params.get('tab');
  if (!target) return;

  document.querySelectorAll('.tabbed-labels > label').forEach(function (label) {
    // strip backticks from labels like "Rstudio server via `srun`"
    var slug = label.textContent.trim()
                    .toLowerCase()
                    .replace(/[`]/g, '')
                    .replace(/\s+/g, '-');
    if (slug === target) {
      label.click();
      label.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});