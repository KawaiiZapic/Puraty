import { currentMatched, shiftRouteViewTree } from ".";

export const RouteView = () => {
  let el = shiftRouteViewTree()?.component({}) ?? <div></div>;
  window.addEventListener("route-update", () => {
    if (!el.parentElement) return;
    const newEl = shiftRouteViewTree()?.component({});
    if (newEl) {
      el.replaceWith(newEl);
      el = newEl;
    }
  });
  return el;
};

export const RouteDebug = () => {
  const el = <div></div>;
  const flushRoute = () => {
    el.innerHTML = "";
    el.textContent = JSON.stringify(currentMatched, null, 2);
  }
  flushRoute();
  window.addEventListener("route-update", flushRoute);
  
  return el;
};