/* =========================================================
   script.js  |  Dunkin Donuts page
   Add to your HTML just before </head>:
   <script src="/505 projects collection/script.js" defer></script>
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Small styles used only by this script ---------- */
  const style = document.createElement("style");
  style.textContent = `
    nav a.active { background: #ff671f; }
    tr.unavailable { opacity: 0.45; }
    tr.unavailable td:last-child::after { content: " (not available now)"; font-size: 0.8em; font-style: italic; }
    .field-error { color: #c0102f; font-size: 0.9rem; margin: 0.25rem 0 0; }
    input.invalid { border-color: #c0102f !important; }
    .form-message { padding: 0.9rem 1.2rem; border-radius: 10px; margin: 1rem 0; font-weight: bold; }
    .form-message.ok { background: #e3f6e7; color: #14532d; }
    .form-message.bad { background: #fde6e9; color: #7f1020; }
    .pw-toggle { margin-left: 0.5rem; padding: 0.3rem 0.8rem !important; font-size: 0.85rem; }
    .pw-meter { height: 6px; max-width: 420px; margin-top: 0.4rem; border-radius: 3px; background: #e8cfc4; overflow: hidden; }
    .pw-meter span { display: block; height: 100%; width: 0; transition: width 0.2s, background 0.2s; }
    #to-top { position: fixed; right: 1rem; bottom: 1rem; display: none; padding: 0.7rem 1rem; }
  `;
  document.head.appendChild(style);

  /* ---------- 1. Highlight the menu rows available right now ---------- */
  // Hours use a 24h clock. Edit these to match your real times.
  const availability = {
    "#d menu": () => true, // Donuts: all day
    "#cmenu": (h) => h >= 5 && h < 12, // Cold drinks: morning only
    "#croissonts": (h) => h >= 16 && h < 21, // Croissants: evenings
    "#hotdrinks": (h) => (h >= 5 && h < 12) || h >= 21 || h < 5, // Hot drinks: mornings and nights
    "#Bakery": () => true, // Bakery: all day
  };

  function markAvailability() {
    const hour = new Date().getHours();
    document
      .querySelectorAll('[id="OUR MENU"] a[href^="#"]')
      .forEach((link) => {
        const check = availability[link.getAttribute("href")];
        if (!check) return;
        const row = link.closest("tr");
        if (row) row.classList.toggle("unavailable", !check(hour));
      });
  }
  markAvailability();

  /* ---------- 2. Highlight the nav link of the section you are in ---------- */
  const navLinks = [...document.querySelectorAll("nav a[href^='#']")];
  const targets = navLinks
    .map((a) => ({
      a,
      el: document.getElementById(
        decodeURIComponent(a.getAttribute("href").slice(1)),
      ),
    }))
    .filter((t) => t.el);

  function updateActiveNav() {
    const y = window.scrollY + 120;
    let current = null;
    targets.forEach((t) => {
      if (t.el.getBoundingClientRect().top + window.scrollY <= y) current = t;
    });
    navLinks.forEach((a) =>
      a.classList.toggle("active", current && a === current.a),
    );
  }

  /* ---------- 3. Back to top button ---------- */
  const toTop = document.createElement("button");
  toTop.id = "to-top";
  toTop.type = "button";
  toTop.textContent = "Back to top";
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
  document.body.appendChild(toTop);

  function onScroll() {
    updateActiveNav();
    toTop.style.display = window.scrollY > 600 ? "block" : "none";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. FAQ: only one answer open at a time ---------- */
  const faqs = document.querySelectorAll("#Fr details");
  faqs.forEach((d) => {
    d.addEventListener("toggle", () => {
      if (d.open)
        faqs.forEach((other) => {
          if (other !== d) other.open = false;
        });
    });
  });

  /* ---------- 5. Newsletter form ---------- */
  const form = document.getElementById("newsetteler");
  if (!form) return;

  const email = form.querySelector('input[placeholder^="Enter you email"]');
  const birthday = form.querySelector('input[type="date"]');
  const decade = form.querySelector('input[type="number"]');
  const password = form.querySelector('input[type="password"]');
  const phone = form.querySelector('input[type="tel"]');
  const joinYes = form.querySelector('input[name="Desecion"][value="yes"]');
  const joinNo = form.querySelector('input[name="Desecion"][value="no"]');
  const terms = form.querySelector('input[type="checkbox"]');

  // Birthday can't be in the future
  if (birthday) birthday.max = new Date().toISOString().split("T")[0];

  // Show / hide password + strength meter
  if (password) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "pw-toggle";
    toggle.textContent = "Show";
    toggle.addEventListener("click", () => {
      const hidden = password.type === "password";
      password.type = hidden ? "text" : "password";
      toggle.textContent = hidden ? "Hide" : "Show";
    });
    password.insertAdjacentElement("afterend", toggle);

    const meter = document.createElement("div");
    meter.className = "pw-meter";
    meter.innerHTML = "<span></span>";
    toggle.insertAdjacentElement("afterend", meter);

    password.addEventListener("input", () => {
      const score = passwordScore(password.value);
      const bar = meter.firstElementChild;
      bar.style.width = (score / 4) * 100 + "%";
      bar.style.background = [
        "#c0102f",
        "#c0102f",
        "#ff671f",
        "#e0b000",
        "#2e9e4f",
      ][score];
    });
  }

  function passwordScore(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  // Helpers for inline errors
  function setError(input, message) {
    clearError(input);
    input.classList.add("invalid");
    const p = document.createElement("p");
    p.className = "field-error";
    p.textContent = message;
    // Place the message after the meter/toggle if present, else after the input
    (input.nextElementSibling &&
    input.nextElementSibling.matches(".pw-meter, .pw-toggle")
      ? input.parentNode.querySelector(".pw-meter") || input
      : input
    ).insertAdjacentElement("afterend", p);
  }

  function clearError(input) {
    input.classList.remove("invalid");
    const next = input.parentNode.querySelectorAll(".field-error");
    next.forEach((n) => {
      if (
        n.dataset.for === input.name ||
        n.previousElementSibling === input ||
        input.parentNode.contains(n)
      ) {
        if (input.parentNode.querySelectorAll("input.invalid").length <= 1)
          n.remove();
      }
    });
  }

  function clearAllErrors() {
    form.querySelectorAll(".field-error").forEach((n) => n.remove());
    form
      .querySelectorAll(".invalid")
      .forEach((n) => n.classList.remove("invalid"));
  }

  function showMessage(text, ok) {
    let box = form.querySelector(".form-message");
    if (!box) {
      box = document.createElement("div");
      box.className = "form-message";
      box.setAttribute("role", "status");
      form.insertBefore(box, form.firstChild);
    }
    box.textContent = text;
    box.classList.toggle("ok", ok);
    box.classList.toggle("bad", !ok);
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Validation on submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearAllErrors();
    let valid = true;
    let firstBad = null;

    function fail(input, message) {
      setError(input, message);
      valid = false;
      if (!firstBad) firstBad = input;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      fail(email, "Enter a valid email, like name@example.com.");
    }

    if (decade && decade.value) {
      const d = Number(decade.value);
      if (d < 1900 || d > new Date().getFullYear())
        fail(decade, "Pick a decade between 1900 and now.");
    }

    if (password.value.length < 8) {
      fail(password, "Use at least 8 characters.");
    } else if (passwordScore(password.value) < 3) {
      fail(password, "Mix upper and lower case letters, numbers or symbols.");
    }

    if (!/^\+?[0-9\s\-()]{8,16}$/.test(phone.value.trim())) {
      fail(phone, "Enter a valid phone number, like +20 1200 0000.");
    }

    if (!joinYes.checked && !joinNo.checked) {
      fail(joinYes, "Choose Yes or No.");
    }

    if (!terms.checked) {
      fail(terms, "You need to accept the terms to register.");
    }

    if (!valid) {
      showMessage("Please fix the highlighted fields.", false);
      firstBad.focus({ preventScroll: true });
      return;
    }

    const wantsNews = joinYes.checked;
    showMessage(
      wantsNews
        ? "You're registered. Look out for our offers in your inbox!"
        : "You're registered. We won't send you the newsletter.",
      true,
    );
    form.reset();
    password.type = "password";
    const meterBar = form.querySelector(".pw-meter span");
    if (meterBar) meterBar.style.width = "0";
  });

  // Clear a field's error as soon as the person edits it
  form.addEventListener("input", (e) => {
    if (e.target.classList.contains("invalid")) {
      e.target.classList.remove("invalid");
      const err = e.target.parentNode.querySelector(".field-error");
      if (err) err.remove();
    }
  });
})();

/* =========================================================
   v2: scroll reveal, 3D donut, tilt, counters, reviews,
   box builder, extra nav links, progress bar, parallax
   ========================================================= */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = (s) => {
    const t = document.createElement("template");
    t.innerHTML = s.trim();
    return t.content.firstElementChild;
  };

  /* Extra nav links (pages) */
  const ul = $("nav ul");
  const menu = $('[id="OUR MENU"]');
  if (ul) {
    [
      ["about.html", "About us"],
      ["locations.html", "Find a branch"],
    ].forEach(([h, t]) => {
      if (!$(`nav a[href="${h}"]`))
        ul.appendChild(html(`<li><a href="${h}">${t}</a></li>`));
    });
    if (menu && !$('nav a[href="#builder"]'))
      ul.appendChild(html('<li><a href="#builder">Build a box</a></li>'));
  }

  /* Scroll progress bar + header parallax */
  const bar = html('<div id="progress"></div>');
  document.body.appendChild(bar);
  const hImg = $("header > img");
  addEventListener(
    "scroll",
    () => {
      bar.style.width =
        (scrollY /
          Math.max(1, document.documentElement.scrollHeight - innerHeight)) *
          100 +
        "%";
      if (hImg && !reduce && scrollY < 700)
        hImg.style.transform = `translateY(${scrollY * 0.15}px)`;
    },
    { passive: true },
  );

  /* ----- New sections (home page only) ----- */
  if (menu) {
    /* 3D spinning ASCII donut hero */
    const hero = html(`<section class="hero3d">
      <div><h2>Fresh. Hot. Sprinkled.</h2>
      <p>Move your mouse across the donut to change its spin.</p>
      <a class="btn" href="#OUR MENU">See the menu</a></div>
      <pre id="donut3d" aria-hidden="true"></pre></section>`);
    $("nav").insertAdjacentElement("afterend", hero);

    const pre = $("#donut3d"),
      W = 60,
      H = 26,
      chars = ".,-~:;=!*#$@";
    let A = 0,
      B = 0,
      vis = true,
      speed = 1;
    new IntersectionObserver((e) => (vis = e[0].isIntersecting)).observe(pre);
    hero.addEventListener(
      "mousemove",
      (e) => (speed = 0.4 + (e.clientX / innerWidth) * 3),
    );
    (function tick() {
      if (vis) {
        const b = new Array(W * H).fill(" "),
          z = new Array(W * H).fill(0);
        const sA = Math.sin(A),
          cA = Math.cos(A),
          cB = Math.cos(B),
          sB = Math.sin(B);
        for (let j = 0; j < 6.28; j += 0.09) {
          const cj = Math.cos(j),
            sj = Math.sin(j);
          for (let i = 0; i < 6.28; i += 0.03) {
            const ci = Math.cos(i),
              si = Math.sin(i),
              h = cj + 2;
            const D = 1 / (si * h * sA + sj * cA + 5),
              t = si * h * cA - sj * sA;
            const x = (W / 2 + 22 * D * (ci * h * cB - t * sB)) | 0;
            const y = (H / 2 + 11 * D * (ci * h * sB + t * cB)) | 0;
            const o = x + W * y;
            const N =
              (8 *
                ((sj * sA - si * cj * cA) * cB -
                  si * cj * sA -
                  sj * cA -
                  ci * cj * sB)) |
              0;
            if (y > 0 && y < H && x >= 0 && x < W && D > z[o]) {
              z[o] = D;
              b[o] = chars[N > 0 ? N : 0];
            }
          }
        }
        let out = "";
        for (let r = 0; r < H; r++)
          out += b.slice(r * W, r * W + W).join("") + "\n";
        pre.textContent = out;
        A += 0.035 * speed;
        B += 0.017 * speed;
      }
      if (!reduce) requestAnimationFrame(tick);
    })();

    /* Animated counters (numbers come from the page itself) */
    const stats = [
      [$$("#kind option").length, "signature donuts"],
      [$$("#donuts option").length, "flavours to pick"],
      [$$('[id="OUR MENU"] a').length, "menu categories"],
      [$$("#offers td img").length, "offers right now"],
    ];
    const statSec = html(
      `<section class="stats">${stats
        .map(([n, l]) => `<div class="stat"><b data-n="${n}">0</b>${l}</div>`)
        .join("")}</section>`,
    );
    const counter = new IntersectionObserver((es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        counter.unobserve(e.target);
        const n = +e.target.dataset.n,
          t0 = performance.now();
        (function step(t) {
          const p = Math.min(1, (t - t0) / 1200);
          e.target.textContent = Math.round(n * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      }),
    );
    $("#Fr").insertAdjacentElement("beforebegin", statSec);
    $$("b", statSec).forEach((b) => counter.observe(b));

    /* 3D flip review carousel (sample text: replace with real reviews) */
    const R = [
      [
        "The pumpkin spice latte is the reason I come back every autumn.",
        "Sample customer",
      ],
      [
        "Chocolate croissant and a cold brew. Perfect start to my morning.",
        "Sample customer",
      ],
      [
        "Buy one, get the rest free is the best deal on the street.",
        "Sample customer",
      ],
    ];
    const rv = html(`<section class="reviews"><h2>What people say</h2>
      <div class="slides">${R.map((r, i) => `<blockquote class="slide${i ? "" : " active"}">${r[0]}<cite>${r[1]}</cite></blockquote>`).join("")}</div>
      <div class="dots">${R.map((_, i) => `<button type="button" class="${i ? "" : "on"}" aria-label="Review ${i + 1}"></button>`).join("")}</div></section>`);
    $("#Fr").insertAdjacentElement("beforebegin", rv);
    const slides = $$(".slide", rv),
      dots = $$(".dots button", rv);
    let cur = 0,
      timer;
    const show = (n) => {
      cur = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("active", i === cur));
      dots.forEach((d, i) => d.classList.toggle("on", i === cur));
    };
    dots.forEach((d, i) => d.addEventListener("click", () => show(i)));
    const auto = () => {
      clearInterval(timer);
      if (!reduce) timer = setInterval(() => show(cur + 1), 5000);
    };
    rv.addEventListener("mouseenter", () => clearInterval(timer));
    rv.addEventListener("mouseleave", auto);
    auto();

    /* Build-a-box mini game */
    const F = [
      ["Chocolate Pistachio", "#8a9a5b"],
      ["Maple Praline", "#c68642"],
      ["Toffee Apple", "#d9a066"],
      ["Smores", "#5c3a21"],
      ["Hazelnut Pie", "#a0522d"],
      ["Rocky Road", "#3b2314"],
      ["Chocolate Monster", "#e11b6d"],
    ];
    const bd =
      html(`<section class="builder" id="builder"><h2>Build your box of 6</h2>
      <p>Tap a donut to add it to the box.</p>
      <div class="flavors">${F.map(([n, c], i) => `<button type="button" data-i="${i}">${n}</button>`).join("")}</div>
      <div class="box">${"<div class='slot'></div>".repeat(6)}</div>
      <p id="box-msg" role="status">0 of 6 picked</p>
      <button type="button" id="box-clear">Clear box</button></section>`);
    $("#offers").insertAdjacentElement("beforebegin", bd);
    const picks = [],
      slotEls = $$(".slot", bd),
      msg = $("#box-msg", bd);
    const draw = () => {
      slotEls.forEach((s, i) => {
        const p = picks[i];
        s.classList.toggle("full", !!p);
        s.style.setProperty("--c", p ? F[p[0]][1] : "");
        s.title = p ? F[p[0]][0] : "";
      });
      msg.textContent =
        picks.length < 6
          ? `${picks.length} of 6 picked`
          : "Box full! Show this at the counter.";
    };
    const confetti = () => {
      if (reduce) return;
      for (let i = 0; i < 50; i++) {
        const c = document.createElement("span");
        c.className = "confetti";
        c.style.background = ["#e11b6d", "#ff671f", "#ffc680", "#ad5c00"][
          i % 4
        ];
        c.style.left = 20 + Math.random() * 60 + "vw";
        c.style.top = "30vh";
        document.body.appendChild(c);
        c.animate(
          [
            { transform: "translate(0,0) rotate(0)", opacity: 1 },
            {
              transform: `translate(${(Math.random() - 0.5) * 400}px,${200 + Math.random() * 300}px) rotate(${Math.random() * 720}deg)`,
              opacity: 0,
            },
          ],
          { duration: 1400 + Math.random() * 800, easing: "ease-out" },
        ).onfinish = () => c.remove();
      }
    };
    $$(".flavors button", bd).forEach((btn) =>
      btn.addEventListener("click", () => {
        if (picks.length >= 6) return;
        picks.push([+btn.dataset.i]);
        draw();
        if (picks.length === 6) confetti();
      }),
    );
    $("#box-clear", bd).addEventListener("click", () => {
      picks.length = 0;
      draw();
    });
  }

  /* 3D tilt on images and review cards */
  $$("td img, .slide, .branch").forEach((el) => {
    el.classList.add("tilt");
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect(),
        x = (e.clientX - r.left) / r.width - 0.5,
        y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.05)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });

  /* Branch search (locations page) */
  const search = $("#branch-search");
  if (search)
    search.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      $$(".branch").forEach(
        (b) =>
          (b.style.display = b.textContent.toLowerCase().includes(q)
            ? ""
            : "none"),
      );
    });

  /* Reveal on scroll (added last so it also covers the new sections) */
  const targets = $$(
    "h1:not(header h1), h2, section, article, aside, fieldset, footer, .tl, .branch",
  ).filter((el) => !el.closest(".reveal") || el.matches(".branch"));
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 },
  );
  targets.forEach((el, i) => {
    el.classList.add("reveal");
    if (i % 3 === 1) el.classList.add("left");
    else if (i % 3 === 2) el.classList.add("right");
    el.style.setProperty("--d", (i % 3) * 0.08 + "s");
    reduce ? el.classList.add("in") : io.observe(el);
  });
})();
