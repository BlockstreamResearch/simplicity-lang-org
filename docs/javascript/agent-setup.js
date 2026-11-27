// Homepage "What it runs" link: shows or hides the setup steps panel
// (markup in overrides/main.html). Copying the prompt is Material's own
// clipboard handling. The listener is on the document so it keeps working
// after Material's instant navigation swaps the page in.
document.addEventListener("click", function (event) {
  var toggle = event.target.closest(".agent-what");
  if (!toggle) return;
  var panel = document.getElementById(toggle.getAttribute("aria-controls"));
  var open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  panel.hidden = !open;
});
