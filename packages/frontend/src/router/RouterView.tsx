import { currentMatched } from ".";

export default () => {
  const el = <div></div>;
  const flushRoute = () => {
    if (!el.parentElement) {
      window.removeEventListener("route-update", flushRoute)
      return;
    }
    el.innerHTML = "";
    const c = currentMatched;
    if (c) {
      el.appendChild(c.component())
    }
  }
  flushRoute();
  window.addEventListener("route-update", flushRoute);
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