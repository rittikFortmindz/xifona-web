(function () {
  "use strict";

  /* Apply config.js (generated from .env) to the DOM.
     Elements opt in with data-cfg-* attributes; anything left unset keeps
     its existing [BRACKET] placeholder markup untouched. */
  var CONFIG = window.SITE_CONFIG || {};

  document.querySelectorAll("[data-cfg-href]").forEach(function (el) {
    var value = CONFIG[el.getAttribute("data-cfg-href")];
    if (!value) return;
    if (el.tagName === "FORM") el.setAttribute("action", value);
    else el.setAttribute("href", value);
  });

  document.querySelectorAll("[data-cfg-mailto]").forEach(function (el) {
    var value = CONFIG[el.getAttribute("data-cfg-mailto")];
    if (value) el.setAttribute("href", "mailto:" + value);
  });

  document.querySelectorAll("[data-cfg-text]").forEach(function (el) {
    var value = CONFIG[el.getAttribute("data-cfg-text")];
    if (value) el.textContent = value;
  });

  document.querySelectorAll("[data-cfg-hide-if-empty]").forEach(function (el) {
    var value = CONFIG[el.getAttribute("data-cfg-hide-if-empty")];
    if (!value) el.style.display = "none";
  });

  if (CONFIG.ANALYTICS_SNIPPET) {
    document.head.insertAdjacentHTML("beforeend", CONFIG.ANALYTICS_SNIPPET);
  }

  /* Mobile nav toggle */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      mobileMenu.classList.toggle("open", !expanded);
      document.body.style.overflow = !expanded ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    if (!question) return;
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".faq-item").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("open", !isOpen);
      question.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* Cookie consent banner */
  var COOKIE_KEY = "xifona_cookie_consent";
  var cookieBanner = document.querySelector(".cookie-banner");
  if (cookieBanner) {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) {
        window.setTimeout(function () { cookieBanner.classList.add("show"); }, 600);
      }
    } catch (e) { /* localStorage unavailable */ }

    cookieBanner.querySelectorAll("[data-cookie-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        try { localStorage.setItem(COOKIE_KEY, btn.getAttribute("data-cookie-action")); } catch (e) {}
        cookieBanner.classList.remove("show");
      });
    });
  }

  /* Contact form (static placeholder handling) */
  var contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      var endpoint = contactForm.getAttribute("action");
      var status = contactForm.querySelector(".form-status");
      var isPlaceholder = !endpoint || endpoint.indexOf("[") === 0 || endpoint.indexOf("CONTACT_FORM_ENDPOINT") !== -1;

      if (isPlaceholder) {
        e.preventDefault();
        var name = encodeURIComponent(contactForm.name.value || "");
        var email = encodeURIComponent(contactForm.email.value || "");
        var topic = encodeURIComponent(contactForm.topic ? contactForm.topic.value : "");
        var message = encodeURIComponent(contactForm.message.value || "");
        var mailto =
          "mailto:" + (CONFIG.SUPPORT_EMAIL || "[SUPPORT_EMAIL]") + "?subject=" +
          encodeURIComponent("Xifona Support (" + (contactForm.topic ? contactForm.topic.value : "General") + ")") +
          "&body=" +
          "Name: " + name + "%0D%0AEmail: " + email + "%0D%0ATopic: " + topic + "%0D%0A%0D%0A" + message;
        window.location.href = mailto;
        if (status) {
          status.textContent = "Opening your email client to send this message…";
          status.classList.remove("error");
          status.classList.add("success");
        }
      }
    });
  }
})();
