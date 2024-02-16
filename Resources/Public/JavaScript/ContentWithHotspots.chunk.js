import { A as AbstractComponentManager } from "./main.bundle.js";
class Logger {
  constructor(scope) {
    this.scope = scope;
    this.enabled = window.__ComponentLoaderComponentRegistry.context.isDevelopment;
    this.filterScopes = [];
  }
  /**
   * Logs all provided arguments if enabled
   */
  log(...args) {
    if (this.enabled && (this.filterScopes.length === 0 || this.filterScopes.indexOf(this.scope) !== -1)) {
      console.log(this.scope + ":", ...args);
    }
  }
  /**
   * Logs all provided arguments
   */
  error(...args) {
    console.error(this.scope + ":", ...args);
  }
}
class Hotspots {
  constructor(domSection, hotspotNodeTypes = ["FormatD.HotspotEditor:Content.Hotspot"]) {
    this.editable = true;
    this.domSection = domSection;
    this.hotspotNodeTypes = hotspotNodeTypes;
    if (document.querySelector("body").classList.contains("neos-backend")) {
      this.initialize();
    }
  }
  setEditable(editable) {
    if (!editable && this.selectedElement) {
      this.selectedElement.removeEventListener("mousedown", this.activeMouseDownListener);
      this.selectedElement.removeEventListener("mouseup", this.activeMouseUpListener);
      this.selectedElement.removeEventListener("mousemove", this.activeMouseMoveListener);
      this.selectedElement = null;
    }
    this.editable = editable;
  }
  initialize() {
    window.parent.addEventListener("fd-hotspot-editor:hotspotInspectorValueChanged", (event) => {
      this._hotspotValueChangeHandler(event);
    });
    document.addEventListener("Neos.NodeSelected", (event) => {
      this.nodeSelectHandler(event);
    }, false);
  }
  _hotspotValueChangeHandler(event) {
    const coordinateId = event.detail.coordinateId;
    if (!coordinateId.includes("x") && !coordinateId.includes("y") || !this.selectedElement) {
      return;
    }
    const coordinateValue = event.detail.coordinateValue;
    if (coordinateId.includes("x")) {
      this._moveElement(this.selectedElement, coordinateValue, void 0);
    }
    if (coordinateId.includes("y")) {
      this._moveElement(this.selectedElement, void 0, coordinateValue);
    }
  }
  nodeSelectHandler(event) {
    const detail = event.detail;
    if (this.hotspotNodeTypes.includes(event.detail.node.nodeType) && this.editable) {
      this.selectedElement = detail.element;
      const containerElement = this.selectedElement.parentElement.parentElement;
      const currentOffsetTop = event.detail.element.offsetTop;
      const currentOffsetLeft = event.detail.element.offsetLeft;
      let initialPosition = { x: 0, y: 0 };
      let offsetPosition = { x: 0, y: 0 };
      let currentPosition = { x: 0, y: 0 };
      if (currentOffsetTop !== void 0 && currentOffsetLeft !== void 0) {
        initialPosition.x = currentOffsetLeft;
        initialPosition.y = currentOffsetTop;
      }
      this.activeMouseUpListener = (mouseEvent) => {
        mouseEvent.preventDefault();
        const containerElement2 = mouseEvent.composedPath().find((element) => {
          return element.className === "content-with-hotspots--container";
        });
        this._dispatchHotspotDraggedEvent({
          x: currentPosition.x + offsetPosition.x,
          y: currentPosition.y + offsetPosition.y
        }, containerElement2);
        initialPosition.x = currentPosition.x;
        initialPosition.y = currentPosition.y;
        containerElement2.removeEventListener("mouseup", this.activeMouseUpListener);
        containerElement2.removeEventListener("mousemove", this.activeMouseMoveListener);
        if (this.selectedElement) {
          this.selectedElement.removeEventListener("mousedown", this.activeMouseDownListener);
        }
      };
      this.activeMouseDownListener = (mouseEvent) => {
        mouseEvent.preventDefault();
        containerElement.addEventListener("mouseup", this.activeMouseUpListener);
        containerElement.addEventListener("mousemove", this.activeMouseMoveListener);
        initialPosition.x = mouseEvent.clientX - offsetPosition.x;
        initialPosition.y = mouseEvent.clientY - offsetPosition.y;
        offsetPosition.x = this.selectedElement.getBoundingClientRect().left - this.selectedElement.parentElement.parentElement.getBoundingClientRect().left;
        offsetPosition.y = this.selectedElement.getBoundingClientRect().top - this.selectedElement.parentElement.parentElement.getBoundingClientRect().top;
      };
      this.activeMouseMoveListener = (mouseEvent) => {
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
        currentPosition.x = mouseEvent.clientX - initialPosition.x;
        currentPosition.y = mouseEvent.clientY - initialPosition.y;
        this._moveElement(this.selectedElement, currentPosition.x + offsetPosition.x, currentPosition.y + offsetPosition.y, "px");
      };
      this.selectedElement.addEventListener("mousedown", this.activeMouseDownListener);
    } else if (this.selectedElement) {
      this.selectedElement.removeEventListener("mousedown", this.activeMouseDownListener);
      this.selectedElement.removeEventListener("mousedown", this.activeMouseUpListener);
      this.selectedElement.removeEventListener("mousedown", this.activeMouseMoveListener);
      this.selectedElement = null;
    }
  }
  _dispatchHotspotDraggedEvent(position, parentElement) {
    if (parentElement) {
      position.x = position.x / parentElement.offsetWidth * 100;
      position.y = position.y / parentElement.offsetHeight * 100;
    }
    const dragEvent = new CustomEvent(
      "fd-hotspot-editor:hotspotDragged",
      {
        detail: {
          Payload: {
            pos: {
              xPosition: position.x,
              yPosition: position.y
            }
          }
        }
      }
    );
    window.parent.dispatchEvent(dragEvent);
  }
  _moveElement(element, x, y, unit) {
    unit = unit || "%";
    if (x) {
      element.style.left = String(x) + unit;
    }
    if (y) {
      element.style.top = String(y) + unit;
    }
  }
  /**
   * Logs all provided arguments if debug is true
   */
  log() {
    if (this.debug) {
      console.log(...arguments);
    }
  }
}
class ContentWithHotspot {
  constructor(logger) {
    this.draggableHotspots = void 0;
    this.logger = logger;
  }
  getDraggableHotspotsNodeTypes(domSection) {
    return ["FormatD.HotspotEditor:Content.Hotspot", "FormatD.HotspotContent:Content.HotspotWithLayer"];
  }
  createDraggableHotspots(domSection) {
    return new Hotspots(domSection, this.getDraggableHotspotsNodeTypes(domSection));
  }
  initialize(domSection) {
    this.initializeBackend(domSection);
    const hotspotAreas = domSection.querySelectorAll(".content-with-hotspots");
    if (hotspotAreas.length < 1)
      return;
    this.initializeFrontend(domSection, hotspotAreas);
  }
  initializeBackend(domSection) {
    this.draggableHotspots = this.createDraggableHotspots(domSection);
  }
  initializeFrontend(domSection, hotspotAreas) {
    this.logger.log("initialized for: ", domSection);
    hotspotAreas.forEach((hotspotArea) => {
      this.initializeHotspotArea(hotspotArea);
    });
  }
  getLayersForHotspotArea(hotspotArea) {
    return Array.from(hotspotArea.querySelectorAll(".hotspot-with-layer--layer"));
  }
  initializeHotspotArea(hotspotArea) {
    this.logger.log("initializing content-with-hotspots:", hotspotArea);
    const layers = this.getLayersForHotspotArea(hotspotArea);
    layers.forEach((layer) => {
      this.initializeLayer(hotspotArea, layer);
    });
    if (layers.length > 0) {
      this.handleClickOutsideShowroomLayer(hotspotArea, layers);
    }
  }
  initializeLayer(hotspotArea, layer) {
    this.logger.log("initializing hotspot layer", layer);
    layer.querySelector(".hotspot-with-layer--layer-close").addEventListener("click", (_) => {
      this.deactivateHotspot(layer.dataset.hotspotId, hotspotArea);
    });
    const hotspot = hotspotArea.querySelector('.hotspot[data-hotspot-id="' + layer.dataset.hotspotId + '"]');
    this.logger.log("initializing corresponding layer hotspot", hotspot);
    hotspot.addEventListener(window.__ComponentLoaderComponentRegistry.context.isBackend() ? "contextmenu" : "click", (event) => {
      event.preventDefault();
      this.activateHotspot(hotspot.dataset.hotspotId, hotspotArea);
    });
    return hotspot;
  }
  /**
   * @param {string} hotspotId
   * @param {HTMLElement} container
   */
  activateHotspot(hotspotId, container) {
    this.logger.log("Activating hotspot", hotspotId);
    this.draggableHotspots["setEditable"](false);
    const layer = container.querySelector('.hotspot-with-layer--layer[data-hotspot-id="' + hotspotId + '"]');
    this.logger.log("Activating layer", layer);
    layer.classList.toggle("js--active");
    this.toggleHotspotsVisibility(container);
  }
  /**
   * @param {string} hotspotId
   * @param {HTMLElement} container
   */
  deactivateHotspot(hotspotId, container) {
    this.logger.log("Deactivating hotspot", hotspotId);
    const layer = container.querySelector('.hotspot-with-layer--layer[data-hotspot-id="' + hotspotId + '"]');
    this.logger.log("Deactivating layer", layer);
    layer.classList.toggle("js--active");
    this.draggableHotspots["setEditable"](true);
    this.toggleHotspotsVisibility(container);
  }
  /**
   * @param {HTMLElement} container
   * @param {NodeListOf<Element>}layers
   */
  handleClickOutsideShowroomLayer(container, layers) {
    if (!window.__ComponentLoaderComponentRegistry.context.isBackend()) {
      document.addEventListener("click", (event) => {
        for (const layer of layers) {
          if (!layer.classList.contains("js--active") || !layer.contains(event.target)) {
            continue;
          }
          if (event.target instanceof HTMLElement && event.target.closest(".hotspot") === null) {
            this.deactivateHotspot(layer.dataset.hotspotId, container);
          }
        }
      });
    }
  }
  /**
   * Hide and show all hotSpots on activating a hotSpot / showroom layer
   * @param {HTMLElement} container
   */
  toggleHotspotsVisibility(container) {
    const hotSpots = container.querySelectorAll(".hotspot");
    hotSpots.forEach((hotSpot) => hotSpot.classList.toggle("hidden"));
  }
}
class ContentWithHotspotsComponentManager extends AbstractComponentManager {
  initialize(domSection) {
    const logger = new Logger("ContentWithHotspots");
    const contentWithHotspots = new ContentWithHotspot(logger);
    contentWithHotspots.initialize(domSection);
  }
}
export {
  ContentWithHotspot,
  ContentWithHotspotsComponentManager as default
};
