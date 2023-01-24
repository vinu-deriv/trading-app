import { setSwipeDirection } from "../stores/ui-store";

export const MAX_MOBILE_WIDTH = 768;

export const isMobile = () => window.innerWidth <= MAX_MOBILE_WIDTH;
export const isDesktop = () => window.innerWidth > MAX_MOBILE_WIDTH;

export const detectTouch = (touchArea) => {
  // Initial mouse X and Y positions are 0
  let mouseX;
  let initialX = 0;
  let mouseY;
  let initialY = 0;
  let isSwiped;
  // Events for touch and mouse
  const events = {
    mouse: {
      down: "mousedown",
      move: "mousemove",
      up: "mouseup",
    },
    touch: {
      down: "touchstart",
      move: "touchmove",
      up: "touchend",
    },
  };
  let deviceType = "";
  // Detect touch device
  const isTouchDevice = () => {
    try {
      // We try to create TouchEvent (it would fail for desktops and throw error)
      document.createEvent("TouchEvent");
      deviceType = "touch";
      return true;
    } catch (e) {
      deviceType = "mouse";
      return false;
    }
  };
  // Get left and top of touchArea
  const rectLeft = touchArea.getBoundingClientRect().left;
  const rectTop = touchArea.getBoundingClientRect().top;

  // Get Exact X and Y position of mouse/touch
  const getXY = (e) => {
    mouseX = (!isTouchDevice() ? e.pageX : e.touches[0].pageX) - rectLeft;
    mouseY = (!isTouchDevice() ? e.pageY : e.touches[0].pageY) - rectTop;
  };
  isTouchDevice();
  // Start Swipe
  touchArea.addEventListener(events[deviceType].down, (event) => {
    isSwiped = true;
    // Get X and Y Position
    getXY(event);
    initialX = mouseX;
    initialY = mouseY;
  });
  // Mousemove / touchmove
  touchArea.addEventListener(events[deviceType].move, (event) => {
    if (!isTouchDevice()) {
      event.preventDefault();
    }
    if (isSwiped) {
      getXY(event);
      const diffX = mouseX - initialX;
      const diffY = mouseY - initialY;
      let direction = "";
      if (Math.abs(diffY) > Math.abs(diffX)) {
        direction = diffY > 0 ? "DOWN" : "UP";
      } else {
        direction = diffX > 0 ? "RIGHT" : "LEFT";
      }
      setSwipeDirection(direction);
    }
  });

  // Stop Drawing
  touchArea.addEventListener(events[deviceType].up, () => {
    isSwiped = false;
  });
  touchArea.addEventListener("mouseleave", () => {
    isSwiped = false;
  });
  window.onload = () => {
    isSwiped = false;
  };
};
