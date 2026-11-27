// Homepage "Copy setup prompt" button and its "What it runs" panel
// (markup in overrides/main.html). Listeners are delegated to the document so
// they keep working after Material's instant navigation swaps the page in.
(function () {
  "use strict";

  var CHECK =
    '<svg class="agent-ico agent-ico--ok" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M21 7 9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59z"/></svg>';
  var MESSAGES = {
    preview:
      "This prompt has your coding agent set up Simplicity in five steps. " +
      "It asks the agent to tell you what it will install before it starts:",
    copied:
      CHECK + "<b>Copied.</b> Paste it into your coding agent. " +
      "The prompt asks it to tell you what it will install before it starts:",
    failed: "<b>Couldn't copy automatically.</b> Select and copy this prompt:",
  };

  var opener = null;
  var resetTimer = null;

  function parts() {
    var panel = document.getElementById("agent-receipt");
    if (!panel) return null;
    return {
      panel: panel,
      msg: panel.querySelector("[data-agent-msg]"),
      prompt: panel.querySelector("[data-agent-prompt]"),
      fallback: panel.querySelector("[data-agent-fallback]"),
      what: document.querySelector("[data-agent-what]"),
    };
  }

  function open(mode) {
    var p = parts();
    if (!p) return;
    p.panel.hidden = false;
    p.what.setAttribute("aria-expanded", "true");
    p.msg.innerHTML = MESSAGES[mode];
    var failed = mode === "failed";
    p.prompt.hidden = failed;
    p.fallback.hidden = !failed;
    if (failed) {
      p.fallback.style.height = "auto";
      p.fallback.style.height =
        p.fallback.scrollHeight + p.fallback.offsetHeight - p.fallback.clientHeight + "px";
      p.fallback.focus();
      p.fallback.select();
    }
  }

  function close() {
    var p = parts();
    if (!p || p.panel.hidden) return;
    p.panel.hidden = true;
    p.what.setAttribute("aria-expanded", "false");
    (opener && document.contains(opener) ? opener : p.what).focus();
  }

  function copied(button) {
    var label = button.querySelector("[data-agent-label]");
    button.classList.add("is-copied");
    label.textContent = "Copied";
    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () {
      button.classList.remove("is-copied");
      label.textContent = "Copy setup prompt";
    }, 2200);
    open("copied");
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    var copy = target.closest("[data-agent-copy]");
    if (copy) {
      opener = copy;
      var text = copy.getAttribute("data-agent-copy");
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          function () { copied(copy); },
          function () { open("failed"); }
        );
      } else {
        open("failed");
      }
      return;
    }
    var what = target.closest("[data-agent-what]");
    if (what) {
      opener = what;
      var p = parts();
      if (p && p.panel.hidden) open("preview");
      else close();
      return;
    }
    if (target.closest("[data-agent-close]")) {
      close();
      return;
    }
    var more = target.closest("[data-agent-more]");
    if (more) {
      var expanded = more.parentElement.classList.toggle("is-open");
      more.textContent = expanded ? "Show less" : "Show full prompt";
      more.setAttribute("aria-expanded", String(expanded));
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") close();
  });
})();
