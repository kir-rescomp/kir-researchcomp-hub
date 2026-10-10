var KATEX    = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
var AUTORENDER = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js";

function loadScript(src, cb) {
  var s    = document.createElement("script");
  s.src    = src;
  s.onload = cb;
  document.head.appendChild(s);
}

function loadKaTeX(cb) {
  if (typeof renderMathInElement !== "undefined") { cb(); return; }
  loadScript(KATEX, function () {
    loadScript(AUTORENDER, cb);
  });
}

document$.subscribe(function (doc) {
  loadKaTeX(function () {
    renderMathInElement(doc.body, {
      delimiters: [
        { left: "$$",   right: "$$",   display: true  },
        { left: "$",    right: "$",    display: false },
        { left: "\\(",  right: "\\)",  display: false },
        { left: "\\[",  right: "\\]",  display: true  }
      ]
    });
  });
});