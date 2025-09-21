const TOP_BAR_HEIGHT = 124;

export const handleSwipe = ($: HTMLElement) => {
  const scrollIndicator = <div style={`position: fixed; right: 0; top: ${TOP_BAR_HEIGHT}px; width: 12px; background: #ccc; height: calc(100vh - ${TOP_BAR_HEIGHT}px); display: none;`}>
    <div style="position: fixed; right: 0; top: var(--scroll-top); height: var(--scroll-height); width: 12px; background: #000;"></div>
  </div> as HTMLElement;
  $.appendChild(scrollIndicator);
  let lastScrollHeight = 0;
  let scrollThumbHeight = 0;
  const elementHeight = $.getBoundingClientRect().height - TOP_BAR_HEIGHT;
  setInterval(() => {
    if (lastScrollHeight === $.scrollHeight) return;
    lastScrollHeight = $.scrollHeight;
    if (lastScrollHeight > elementHeight + TOP_BAR_HEIGHT) {
      scrollThumbHeight = elementHeight / lastScrollHeight * elementHeight;
      $.style.paddingRight = "12px";
      scrollIndicator.style.display = "";
      scrollIndicator.style.setProperty("--scroll-height", scrollThumbHeight + "px");
      scrollIndicator.style.setProperty("--scroll-top", TOP_BAR_HEIGHT + "px");
    } else {
      $.style.paddingRight = "";
      scrollIndicator.style.display = "none";
    }
  });
  let currentTouch: Touch | undefined;
  let startTime = 0;
  ($ as HTMLElement).addEventListener("touchstart", (e) => {
    currentTouch = e.touches[0];
    startTime = Date.now();
  });

  ($ as HTMLElement).addEventListener("touchend", (e) => {
    if (!currentTouch || lastScrollHeight <= elementHeight + TOP_BAR_HEIGHT) return;
    const endTouch = Array.from(e.changedTouches).find(v => v.identifier === currentTouch!.identifier);
    if (!endTouch) return;
    const duration = Date.now() - startTime;
    const xAccel = (endTouch.clientX - currentTouch.clientX) / duration;
    const yAccel = (endTouch.clientY - currentTouch.clientY) / duration;
    let result = "";
    if (Math.abs(xAccel) > Math.abs(yAccel)) {
      result = xAccel > 0 ? "+x" : "-x";
    } else {
      result = yAccel > 0 ? "+y" : "-y";
    }

    if (Math.abs(yAccel) > 0.2) {
      const scroll = elementHeight * 0.8;
      if (result === "+y") {
        $.scrollTop -= scroll;
      } else if (result === "-y") {
        $.scrollTop += scroll;
      }
      const availableMoveSpace = elementHeight - scrollThumbHeight;
      scrollIndicator.style.setProperty("--scroll-top", 124 + $.scrollTop / (lastScrollHeight - elementHeight - TOP_BAR_HEIGHT) * availableMoveSpace + "px");
    }
  });

  ($ as HTMLElement).addEventListener("touchcancel", (e) => {
    if (!currentTouch) return;
    if (Array.from(e.changedTouches).find(v => v.identifier === currentTouch!.identifier)) {
      currentTouch = undefined;
    }
  });
}