(function () {
  "use strict";

  var P = window.PORTFOLIO;

 
  var SECTIONS = [
    { key: "A", id: "about",        label: "About me",     short: "About",   tone: "gold" },
    { key: "E", id: "experience",   label: "Experience",   short: "Work",     tone: "gold",  list: P.experience },
    { key: "P", id: "projects",     label: "Projects",     short: "Projects", long: "Projects & activities", tone: "amber", list: P.projects },
    { key: "C", id: "certificates", label: "Certificates", short: "Certs",    long: "Certificates & awards", tone: "sage",  list: P.certificates },
    { key: "G", id: "contact",      label: "Get in touch", short: "Contact",  tone: "gold" }
  ];
  var byKey = {}, byId = {}, itemIndex = {};
  SECTIONS.forEach(function (s) {
    byKey[s.key] = s; byId[s.id] = s;
    (s.list || []).forEach(function (it, i) { itemIndex[it.id] = { section: s, i: i }; });
  });

  var screen = document.getElementById("screen");
  var keyboard = document.getElementById("keyboard");
  var keyEls = {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

 
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null) return;
      if (k === "text") n.textContent = v;
      else if (k === "class") n.className = v;
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function addKeyEl(k, b) { (keyEls[k] = keyEls[k] || []).push(b); }

 
  var LAYOUT = [
    { cls: "r0", keys: [["esc", 1.5], "1","2","3","4","5","6","7","8","9","0","-","=", ["delete", 1.5]] },
    { keys: [["tab", 1.5, 0], "Q","W","E","R","T","Y","U","I","O","P",["[", 1, 0],["]", 1, 0], ["\\", 1.5, 0]] },
    { keys: [["caps", 1.8, 0], "A","S","D","F","G","H","J","K","L",[";", 1, 0],["'", 1, 0], ["return", 2.2, 0]] },
    { keys: [["shift", 2.3, 1.5], "Z","X","C","V","B","N","M",[",", 1, 0],[".", 1, 0],["/", 1, 0], ["shift", 2.7, 1.5]] },
    { keys: [["fn", 1, 0], ["ctrl", 1, 0], ["opt", 1, 0], ["cmd", 1.3, 1.5], ["", 5.4, 5], ["cmd", 1.3, 1.5], ["opt", 1, 0], "ARROWS"] }
  ];

  function litKey(s) {
    var b = el("button", { type: "button", class: "key lit t-" + s.tone, "aria-label": s.key + ": " + (s.long || s.label) }, [
      el("span", { class: "cap", text: s.key }),
      el("span", { class: "lbl", text: s.label })
    ]);
    
    b.style.setProperty("--lf", Math.min(1, 5.1 / (s.label.length * 0.56)).toFixed(2) + "cqi");
    b.addEventListener("click", function () { go(s.id); });
    addKeyEl(s.key, b);
    return b;
  }

  function deadKey(label, w, n) {
    var b = el("span", { class: "key dead" + (n === 0 ? " wide-only" : ""), "aria-hidden": "true" }, [el("span", { class: label.length > 1 ? "cap-sm" : "cap", text: label })]);
    b.style.setProperty("--w", w || 1);
    if (n) b.style.setProperty("--wn", n);
    return b;
  }

  function makeArrows() {
    var box = el("span", { class: "arrows wide-only", "aria-hidden": "true" });
    ["▲", "◀", "▼", "▶"].forEach(function (a, i) { box.appendChild(el("span", { class: "key a" + i }, [el("span", { class: "cap-sm", text: a })])); });
    return box;
  }

  var full = el("div", { class: "kb-full" });
  LAYOUT.forEach(function (row) {
    var r = el("div", { class: "kb-row" + (row.cls ? " " + row.cls : "") });
    row.keys.forEach(function (k) {
      if (k === "ARROWS") return r.appendChild(makeArrows());
      var label = Array.isArray(k) ? k[0] : k, w = Array.isArray(k) ? k[1] : 1, n = Array.isArray(k) ? k[2] : undefined;
      r.appendChild(byKey[label] ? litKey(byKey[label]) : deadKey(label, w, n));
    });
    full.appendChild(r);
  });
  keyboard.appendChild(full);

  
  var touch = window.matchMedia && window.matchMedia("(hover: none)").matches;

  document.getElementById("laptop").insertAdjacentElement("afterend", el("p", { class: "kb-guide", "aria-hidden": "true" },
    SECTIONS.map(function (s) {
      return el("span", { class: "t-" + s.tone }, [el("b", { text: s.key }), " " + s.label]);
    })));

  function pressAnim(k) {
    (keyEls[k] || []).forEach(function (b) {
      b.classList.add("is-down");
      setTimeout(function () { b.classList.remove("is-down"); }, 140);
    });
  }
  function markCurrent(sectionId) {
    SECTIONS.forEach(function (s) {
      (keyEls[s.key] || []).forEach(function (b) {
        b.classList.toggle("is-current", s.id === sectionId);
        if (s.id === sectionId) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
      });
    });
  }


  function setScreen(view, hash) {
    screen.innerHTML = "";
    screen.appendChild(view);
    screen.scrollTop = 0;
    var url = location.pathname + location.search + (hash ? "#" + hash : "");
    try { history.replaceState(null, "", url); } catch (e) {}
  }

  function bar(left, right) {
    return el("div", { class: "bar" }, [left, el("div", { class: "bar-actions" }, right)]);
  }
  function heading(s, title, count) {
    return bar(el("h2", { class: "tag" }, [
      el("kbd", { text: s.key }),
      el("span", { text: title }),
      count != null ? el("span", { class: "tag-count", text: String(count) }) : null
    ]), [homeBtn()]);
  }
  function homeBtn() {
    return el("button", { type: "button", class: "icon-btn", onclick: home, text: "Home" });
  }

  function home() {
    markCurrent(null);
    var parts = P.name.split(" ");
    var v = el("div", { class: "view home" }, [
      el("div", { class: "home-id" }, [
        el("img", { class: "home-photo", src: P.photo, alt: P.name, width: "150", height: "150" }),
        el("div", null, [
          el("h1", null, [parts[0], el("span", { text: parts.slice(1).join(" ") })]),
          el("p", { class: "home-role", text: P.role + ", " + P.school })
        ])
      ]),
      el("p", { class: "prompt" }, [touch ? "Press a lit key to look around" : "Press a lit key to look around", el("span", { class: "caret", "aria-hidden": "true" })]),
      el("div", { class: "home-menu" }, SECTIONS.map(function (s) {
        return el("button", { type: "button", class: "menu-btn t-" + s.tone, onclick: function () { go(s.id); } },
          [el("kbd", { text: s.key }), el("span", { text: s.long || s.label })]);
      }))
    ]);
    setScreen(v, "");
  }

  function about() {
    var A = P.about;
    var s = byId.about;
    var dl = el("dl", { class: "facts" });
    A.education.forEach(function (e) {
      dl.appendChild(el("dt", { text: "Education" }));
      dl.appendChild(el("dd", null, [el("strong", { text: e[0] }), el("span", { class: "sub", text: e[1] + ", " + e[2] })]));
    });
    dl.appendChild(el("dt", { text: "Languages" }));
    dl.appendChild(el("dd", { text: A.languages }));
    dl.appendChild(el("dt", { text: "Skills" }));
    dl.appendChild(el("dd", null, [el("div", { class: "chips" }, A.skills.map(function (c) { return el("span", { class: "chip", text: c }); }))]));

    setScreen(el("div", { class: "view t-gold" }, [
      heading(s, "About me"),
      el("p", { class: "v-body", text: A.bio }),
      dl
    ]), "about");
  }

  function list(s) {
    var v = el("div", { class: "view t-" + s.tone }, [
      heading(s, s.long || s.label, s.list.length),
      el("p", { class: "list-hint", text: (touch ? "Tap" : "Select") + " an item to see the details" }),
      el("ul", { class: "rows" }, s.list.map(function (it) {
        return el("li", null, [el("button", { type: "button", class: "row", onclick: function () { detail(it.id); } }, [
          el("span", { class: "row-main" }, [
            el("span", { class: "row-title", text: it.title }),
            it.org ? el("span", { class: "row-org", text: it.org }) : null
          ]),
          el("span", { class: "row-date", text: it.date || "" }),
          el("span", { class: "row-go", "aria-hidden": "true", text: "›" })
        ])]);
      }))
    ]);
    setScreen(v, s.id);
  }

  function detail(id) {
    var ref = itemIndex[id];
    if (!ref) return home();
    var s = ref.section, it = s.list[ref.i], n = s.list.length;
    markCurrent(s.id);

    var back = el("button", { type: "button", class: "icon-btn", onclick: function () { list(s); }, text: "‹ " + s.label });
    var prev = el("button", { type: "button", class: "icon-btn", "aria-label": "Previous", text: "‹", onclick: function () { detail(s.list[(ref.i - 1 + n) % n].id); } });
    var next = el("button", { type: "button", class: "icon-btn", "aria-label": "Next", text: "›", onclick: function () { detail(s.list[(ref.i + 1) % n].id); } });

    var v = el("article", { class: "view t-" + s.tone }, [
      bar(back, [el("span", { class: "pos", text: (ref.i + 1) + " / " + n }), prev, next]),
      el("h2", { class: "v-title", text: it.title })
    ]);
    if (it.org || it.date) {
      v.appendChild(el("p", { class: "v-meta" }, [
        it.org ? el("span", { text: it.org }) : null,
        it.date ? el("span", { class: "date", text: it.date }) : null
      ]));
    }
    if (it.body) v.appendChild(el("p", { class: "v-body", text: it.body }));
    if (it.bullets) v.appendChild(el("ul", { class: "v-list" }, it.bullets.map(function (b) { return el("li", { text: b }); })));

    var acts = el("div", { class: "actions" });
    if (it.cert) acts.appendChild(el("a", { class: "btn", href: encodeURI(it.cert), target: "_blank", rel: "noopener", text: "Open certificate" }));
    if (it.link) acts.appendChild(el("a", { class: "btn", href: it.link, target: "_blank", rel: "noopener", text: it.linkLabel || "Open link" }));
    if (acts.childNodes.length) v.appendChild(acts);

    setScreen(v, it.id);
  }

  function contact() {
    var s = byId.contact;
    function row(k, valueNode, copyText) {
      var li = el("li", null, [el("span", { class: "k", text: k }), valueNode]);
      if (copyText) {
        var b = el("button", { type: "button", class: "icon-btn copy", text: "Copy" });
        b.addEventListener("click", function () {
          var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1600); };
          var fallback = function () {
            var r = document.createRange(); r.selectNodeContents(valueNode);
            var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
          };
          try { navigator.clipboard.writeText(copyText).then(done, fallback); } catch (e) { fallback(); }
        });
        li.appendChild(b);
      }
      return li;
    }
    setScreen(el("div", { class: "view t-gold" }, [
      heading(s, "Get in touch"),
      el("ul", { class: "contact" }, [
        row("Email", el("a", { class: "v", href: "mailto:" + P.email, text: P.email }), P.email),
        row("Phone", el("a", { class: "v", href: P.phoneHref, text: P.phone }), P.phone),
        row("LinkedIn", el("a", { class: "v", href: P.linkedin, target: "_blank", rel: "noopener", text: "tolen-bajobair" })),
        row("GitHub", el("a", { class: "v", href: P.github, target: "_blank", rel: "noopener", text: "tolenbajobair" })),
        row("Based in", el("span", { class: "v", text: P.location }))
      ])
    ]), "contact");
  }

  function go(id) {
    var s = byId[id];
    if (!s) return home();
    markCurrent(s.id);
    if (s.id === "about") about();
    else if (s.id === "contact") contact();
    else list(s);
  }

 
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.key === "Escape") { home(); return; }
    if (e.key.length === 1) {
      var s = byKey[e.key.toUpperCase()];
      if (s) { pressAnim(s.key); go(s.id); }
    }
  });

  
  var foot = document.getElementById("foot-links");
  [["mailto:" + P.email, P.email], [P.phoneHref, P.phone], [P.linkedin, "LinkedIn"], [P.github, "GitHub"]].forEach(function (l) {
    var a = el("a", { href: l[0], text: l[1] });
    if (/^https?:/.test(l[0])) { a.target = "_blank"; a.rel = "noopener"; }
    foot.appendChild(el("li", null, [a]));
  });

  
  var laptopEl = document.getElementById("laptop");
  var lidEl = laptopEl.querySelector(".lid");
  function markOpen() { laptopEl.classList.add("is-open"); }
  if (reduceMotion || !lidEl) markOpen();
  else {
    lidEl.addEventListener("animationend", function (e) { if (e.target === lidEl) markOpen(); });
    setTimeout(markOpen, 2500);
  }

  if (!reduceMotion) {
    keyboard.classList.add("booting");
    setTimeout(function () { keyboard.classList.remove("booting"); }, 3200);
  }
  var h = location.hash.slice(1);
  if (byId[h]) go(h);
  else if (itemIndex[h]) detail(h);
  else home();
})();
