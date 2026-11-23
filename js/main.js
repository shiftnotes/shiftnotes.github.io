(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var mobile = document.querySelector(".nav-mobile");

  function setScrolled() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });

  function closeMenu() {
    if (!toggle || !mobile) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "開啟選單");
    mobile.classList.remove("is-open");
    mobile.hidden = true;
    document.body.classList.remove("nav-lock");
  }

  function openMenu() {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "關閉選單");
    mobile.hidden = false;
    mobile.classList.add("is-open");
    document.body.classList.add("nav-lock");
  }

  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeMenu();
      else openMenu();
    });
    mobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 960) closeMenu();
    });
  }
})();

(function () {
  var year = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric"
  }).format(new Date());
  document.querySelectorAll(".js-year").forEach(function (el) {
    el.textContent = year;
  });
})();

(function () {
  var form = document.getElementById("discount-form");
  if (!form) return;

  var HASH = "fc20dca006c240b350fd69723c588b356f4bdd3d61be977d4859ae25a2970762";
  var KEY = "sn-disc";
  var LINKS = {
    notes: {
      full: "https://p.ecpay.com.tw/32C1055",
      sale: "https://p.ecpay.com.tw/29430E5"
    },
    coaching: {
      full: "https://p.ecpay.com.tw/34B3D2C",
      sale: "https://p.ecpay.com.tw/4C820CF"
    }
  };
  var PRICES = {
    notes: { full: "NT$4,800", sale: "NT$4,320" },
    coaching: { full: "NT$9,800", sale: "NT$8,820" }
  };

  var input = document.getElementById("discount-code");
  var msg = document.getElementById("discount-msg");

  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) {
      return ("0" + b.toString(16)).slice(-2);
    }).join("");
  }

  function hashOf(value) {
    if (!window.crypto || !crypto.subtle || !window.TextEncoder) {
      return Promise.resolve("");
    }
    var data = new TextEncoder().encode(String(value).trim().toUpperCase());
    return crypto.subtle.digest("SHA-256", data).then(hex);
  }

  function setMsg(text, kind) {
    if (!msg) return;
    if (!text) {
      msg.hidden = true;
      msg.textContent = "";
      msg.className = "discount-msg";
      return;
    }
    msg.hidden = false;
    msg.textContent = text;
    msg.className = "discount-msg is-" + (kind || "ok");
  }

  function setPrices(on) {
    ["notes", "coaching"].forEach(function (key) {
      var card = document.getElementById("plan-" + key);
      if (!card) return;
      if (on) card.classList.add("is-discounted");
      else card.classList.remove("is-discounted");
      var now = card.querySelector(".plan-price-now");
      if (now) now.textContent = on ? PRICES[key].sale : PRICES[key].full;
      var note = card.querySelector(".plan-discount-note");
      if (note) note.hidden = !on;
      var buy = card.querySelector('[data-ecpay="' + key + '"]');
      if (buy) buy.setAttribute("href", on ? LINKS[key].sale : LINKS[key].full);
    });
  }

  function apply(ok, announce) {
    if (ok) {
      setPrices(true);
      try { sessionStorage.setItem(KEY, "1"); } catch (err) {}
      if (announce) setMsg("", "");
    } else {
      setPrices(false);
      try { sessionStorage.removeItem(KEY); } catch (err) {}
      if (announce) setMsg("折扣碼無效", "error");
      else setMsg("", "");
    }
  }

  function tryCode(value, announce) {
    return hashOf(value).then(function (h) {
      var ok = h === HASH;
      apply(ok, announce);
      return ok;
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    tryCode(input ? input.value : "", true);
  });

  var urlCode = "";
  try {
    urlCode = new URLSearchParams(window.location.search).get("code") || "";
  } catch (err) {}

  if (urlCode) {
    if (input) input.value = urlCode;
    tryCode(urlCode, true);
  } else {
    var saved = false;
    try { saved = sessionStorage.getItem(KEY) === "1"; } catch (err) {}
    if (saved) apply(true, false);
  }
})();
