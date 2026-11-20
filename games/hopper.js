/* [ ] next toy, [ ] previous, P plays the period (a new toy every 15s). */
(function () {
  const list = window.ARCADE || [];
  const here = location.pathname.split("/").pop();
  let i = list.findIndex(g => g[0] === here);
  if (i < 0) return;
  const go = n => { location.href = list[(n + list.length) % list.length][0]; };
  const btn = (label, fn) => {
    const a = document.createElement("button");
    a.type = "button";
    a.textContent = label;
    a.addEventListener("click", fn);
    return a;
  };
  const bar = document.createElement("div");
  bar.id = "hopper";
  bar.append(btn("prev", () => go(i - 1)), btn("next", () => go(i + 1)), btn("period", toggle));
  document.body.append(bar);
  let timer = null;
  function toggle() {
    if (timer) { clearInterval(timer); timer = null; bar.lastChild.textContent = "period"; return; }
    bar.lastChild.textContent = "period on";
    timer = setInterval(() => go(i + 1), 15000);
  }
  addEventListener("keydown", e => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable)) return;
    if (e.key === "]" || (e.key === "ArrowRight" && e.altKey)) go(i + 1);
    else if (e.key === "[" || (e.key === "ArrowLeft" && e.altKey)) go(i - 1);
    else if (e.key.toLowerCase() === "p" && e.shiftKey) toggle();
  });
})();
