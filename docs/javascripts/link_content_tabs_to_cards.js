document$.subscribe(function () {
  var hash = window.location.hash;
  if (hash.startsWith('#tab-')) {
    var target = hash.slice(5); // e.g. "open-ondemand"
    document.querySelectorAll('.tabbed-labels > label').forEach(function (label) {
      var slug = label.textContent.trim().toLowerCase().replace(/\s+/g, '-');
      if (slug === target) {
        label.click();
        label.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});