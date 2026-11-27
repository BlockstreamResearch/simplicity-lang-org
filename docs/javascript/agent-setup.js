// Homepage "What it runs" link: shows or hides the setup steps panel
// (markup in overrides/main.html). The × button and Esc also close it.
// Copying the prompt is Material's own clipboard handling. Listeners are on
// the document so they keep working after Material's instant navigation
// swaps the page in.
(function () {
  function setOpen(open) {
    var toggle = document.querySelector(".agent-what");
    var panel = document.getElementById("agent-steps");
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    if (!open) toggle.focus();
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest(".agent-what")) {
      setOpen(document.getElementById("agent-steps").hidden);
    } else if (event.target.closest(".agent-steps__close")) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    var panel = document.getElementById("agent-steps");
    if (event.key === "Escape" && panel && !panel.hidden) setOpen(false);
  });
})();
