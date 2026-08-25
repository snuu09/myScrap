/**
 * Operator identity for the Korean footer and legal pages.
 * Empty config fields render as 표시 예정 / To be shown. Never invent registrations.
 */
(function (global) {
  function pending(lang) {
    return lang === "en" ? "To be shown" : "표시 예정";
  }

  function legalTable() {
    return (global.MybraryConfig && global.MybraryConfig.legal) || {};
  }

  function value(key) {
    const raw = legalTable()[key];
    return raw && String(raw).trim() ? String(raw).trim() : "";
  }

  function fill(root, lang) {
    const doc = root || document;
    const locale = lang === "en" ? "en" : "ko";
    const placeholder = pending(locale);
    ["operator", "representative", "address", "phone", "email", "host"].forEach((key) => {
      const text = value(key) || placeholder;
      doc.querySelectorAll("[data-legal='" + key + "']").forEach((node) => {
        node.textContent = text;
      });
    });
    const email = value("email");
    doc.querySelectorAll("[data-legal-email]").forEach((anchor) => {
      if (email) {
        anchor.setAttribute("href", "mailto:" + email);
      } else {
        anchor.removeAttribute("href");
      }
    });
    const year = String(new Date().getFullYear());
    doc.querySelectorAll("[data-legal-year]").forEach((node) => {
      node.textContent = year;
    });
  }

  global.MybraryLegal = {
    fill: fill,
    value: value,
    pending: pending,
  };
})(window);
