import { currentMatched, shiftRouteViewTree } from ".";

export const RouteView = () => {
  let el = shiftRouteViewTree()?.component({}) ?? document.createComment("");
  window.addEventListener("route-update", () => {
    if (!el.parentNode) return;
    const newEl = shiftRouteViewTree()?.component({});
    if (newEl) {
      el.parentNode?.replaceChild(newEl, el);
      el = newEl;
    }
  });
  return el;
};

export const RouteDebug = () => {
  const el = <div></div>;
  const flushRoute = () => {
    el.textContent = JSON.stringify(currentMatched, null, 2);
  }
  flushRoute();
  window.addEventListener("route-update", flushRoute);
  
  return el;
};