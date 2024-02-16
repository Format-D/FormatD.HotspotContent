const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/_Resources/Static/Packages/FormatD.HotspotContent/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  if (!deps || deps.length === 0) {
    return baseModule();
  }
  const links = document.getElementsByTagName("link");
  return Promise.all(deps.map((dep) => {
    dep = assetsURL(dep);
    if (dep in seen)
      return;
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? '[rel="stylesheet"]' : "";
    const isBaseRelative = !!importerUrl;
    if (isBaseRelative) {
      for (let i = links.length - 1; i >= 0; i--) {
        const link2 = links[i];
        if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
          return;
        }
      }
    } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = isCss ? "stylesheet" : scriptRel;
    if (!isCss) {
      link.as = "script";
      link.crossOrigin = "";
    }
    link.href = dep;
    document.head.appendChild(link);
    if (isCss) {
      return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
      });
    }
  })).then(() => baseModule()).catch((err) => {
    const e = new Event("vite:preloadError", { cancelable: true });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  });
};
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
var ReloadReason = /* @__PURE__ */ ((ReloadReason2) => {
  ReloadReason2["Ready"] = "ready";
  ReloadReason2["Reload"] = "reload";
  ReloadReason2["BackendReload"] = "reload_backend";
  ReloadReason2["ModalReload"] = "reload_modal";
  return ReloadReason2;
})(ReloadReason || {});
class AbstractComponentManager {
  async reload(domSection) {
    return this.initialize(domSection);
  }
  async backendReload(domSection) {
    return this.reload(domSection);
  }
  async modalReload(domSection) {
    return this.reload(domSection);
  }
  async load(domSection, reason) {
    switch (reason) {
      case "ready":
        return this.initialize(domSection);
      case "reload":
        return this.reload(domSection);
      case "reload_backend":
        return this.backendReload(domSection);
      case "reload_modal":
        return this.modalReload(domSection);
    }
  }
}
class ComponentManagerLoadEvent extends CustomEvent {
  constructor(key, domSection, reason) {
    super(ComponentManagerLoadEvent.BuildType(key), { detail: { domSection, reason } });
  }
  static BuildType(key) {
    return `${key}#load`;
  }
}
class ComponentManagerReloadReasonEvent extends CustomEvent {
  constructor(key, domSection, reason) {
    super(ComponentManagerReloadReasonEvent.BuildType(key, reason), { detail: { domSection, reason } });
  }
  static BuildType(key, reason) {
    return `${key}%${reason}`;
  }
}
var EventTypes = /* @__PURE__ */ ((EventTypes2) => {
  EventTypes2["Reload"] = "fdds.evaluateJs";
  EventTypes2["ReloadModal"] = "fdds.evaluateJsModal";
  EventTypes2["ReloadBackend"] = "Neos.NodeCreated";
  return EventTypes2;
})(EventTypes || {});
class LegacyComponentManager extends AbstractComponentManager {
  constructor(legacyFunction, key) {
    super();
    this.legacyFunction = legacyFunction;
    console.warn(`Using LegacyComponentManager for [${key}]`);
  }
  async initialize(domSection) {
    return this.legacyFunction(domSection);
  }
}
class ComponentLoader {
  constructor() {
    this.loads = {};
    this.componentInstances = {};
    this.alreadyLoaded = [];
    this.eventTarget = new EventTarget();
    this.conditionalRegisters = [];
  }
  async initialize(onInitializeCallback = async () => {
  }) {
    const log = (...args) => console.log("ComponentLoader: ", ...args);
    for (const conditionalRegister of this.conditionalRegisters) {
      if (conditionalRegister.check()) {
        window.__ComponentLoaderComponentRegistry.register(...conditionalRegister.keys);
      }
    }
    await ComponentLoader.ListenOnInitializeReady(async () => {
      await this.load(window.__ComponentLoaderComponentRegistry.components, document, ReloadReason.Ready);
      await onInitializeCallback(document, ReloadReason.Ready);
    });
    ComponentLoader.ListenOnInitializeReload(async (event) => {
      this.initializeComponentsByDataAttribute(event.detail.domSection);
      await this.load(window.__ComponentLoaderComponentRegistry.components, event.detail.domSection, ReloadReason.Reload, true);
      await onInitializeCallback(event.detail.domSection, ReloadReason.Reload);
    });
    ComponentLoader.ListenOnInitializeModalReload(async (event) => {
      this.initializeComponentsByDataAttribute(event.detail.domSection);
      await this.load(window.__ComponentLoaderComponentRegistry.components, event.detail.domSection, ReloadReason.ModalReload, true);
      await onInitializeCallback(event.detail.domSection, ReloadReason.ModalReload);
    });
    ComponentLoader.ListenOnInitializeBackendReload(async (event) => {
      log("on reload backend", event);
      this.initializeComponentsByDataAttribute(event.detail.element);
      await this.load(window.__ComponentLoaderComponentRegistry.components, event.detail.element, ReloadReason.BackendReload, true);
      await onInitializeCallback(event.detail.element, ReloadReason.BackendReload);
    });
  }
  initializeComponentsByDataAttribute(domSection) {
    var _a;
    for (const scriptElement of domSection.querySelectorAll("script")) {
      if ((((_a = scriptElement.dataset.registerComponent) == null ? void 0 : _a.length) ?? 0) > 0 && scriptElement.dataset.registerComponent) {
        window.__ComponentLoaderComponentRegistry.register(scriptElement.dataset.registerComponent);
      }
    }
  }
  add(key, loadHandler) {
    this.loads[key] = loadHandler;
  }
  resolveInstance(key, importedModule) {
    if (!(key in this.componentInstances)) {
      if (importedModule.default === void 0) {
        throw new Error(`No default export found trying to import component [${key}]`);
      }
      this.componentInstances[key] = ComponentLoader.ResolveDefaultImportManager(importedModule.default, key);
    }
    return this.componentInstances[key];
  }
  addDefaultImport(key, importer) {
    this.add(key, async (domSection, reason) => {
      const imported = await importer();
      const instance = this.resolveInstance(key, imported);
      await instance.load(domSection, reason);
    });
  }
  addConditionalRegister(check, keys) {
    if (typeof keys === "string") {
      keys = [keys];
    }
    this.conditionalRegisters.push({
      keys,
      check
    });
  }
  async load(keys, domSection, reason, forceReload = false) {
    if (forceReload) {
      this.alreadyLoaded = [];
    }
    if (typeof keys === "string") {
      keys = [keys];
    }
    for (const key of keys) {
      if (this.alreadyLoaded.includes(key)) {
        continue;
      }
      if (Object.keys(this.loads).includes(key)) {
        await this.loads[key](domSection, reason);
        this.eventTarget.dispatchEvent(new ComponentManagerReloadReasonEvent(key, domSection, reason));
        this.eventTarget.dispatchEvent(new ComponentManagerLoadEvent(key, domSection, reason));
        this.alreadyLoaded.push(key);
      } else {
        console.warn("FormatD_Loader: Failed to load unregistered item: " + key);
      }
    }
  }
  onLoad(key, listener) {
    this.eventTarget.addEventListener(ComponentManagerLoadEvent.BuildType(key), listener);
  }
  removeOnLoadListener(key, reason, listener) {
    this.eventTarget.removeEventListener(ComponentManagerLoadEvent.BuildType(key), listener);
  }
  onReloadReason(key, reason, listener) {
    this.eventTarget.addEventListener(ComponentManagerReloadReasonEvent.BuildType(key, reason), listener);
  }
  removeOnReloadReasonListener(key, reason, listener) {
    this.eventTarget.removeEventListener(ComponentManagerReloadReasonEvent.BuildType(key, reason), listener);
  }
  static async ListenOnInitializeReady(listener) {
    const documentAlreadyLoaded = "attachEvent" in document ? document.readyState === "complete" : document.readyState !== "loading";
    if (documentAlreadyLoaded) {
      await listener();
    } else {
      document.addEventListener("DOMContentLoaded", listener);
    }
  }
  static ListenOnInitializeReload(listener) {
    document.addEventListener(EventTypes.Reload, listener);
  }
  static ListenOnInitializeModalReload(listener) {
    document.addEventListener(EventTypes.ReloadModal, listener);
  }
  static ListenOnInitializeBackendReload(listener) {
    if (window.__ComponentLoaderComponentRegistry.context.isBackend()) {
      document.addEventListener(EventTypes.ReloadBackend, listener);
    }
  }
  static ResolveDefaultImportManager(defaultExport, key) {
    if (defaultExport.prototype instanceof AbstractComponentManager) {
      return new defaultExport();
    }
    return new LegacyComponentManager(defaultExport, key);
  }
}
const componentLoader = new ComponentLoader();
componentLoader.addDefaultImport("FormatD.HotspotContent:Molecule.ContentWithHotspots", () => __vitePreload(() => import("./ContentWithHotspots.chunk.js"), true ? [] : void 0));
componentLoader.initialize();
export {
  AbstractComponentManager as A
};
