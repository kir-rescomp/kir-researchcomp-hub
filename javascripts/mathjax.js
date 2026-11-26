window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex",
  },
};

window.addEventListener("load", function () {
  if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
      MathJax.typesetPromise();
    });
  }
});