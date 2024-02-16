import Hotspots from "@packages/Application/FormatD.HotspotEditor/Resources/Private/Scripts/HotspotEditorFrontend/Hotspots"
import Logger from "./Logger"
import { AbstractComponentManager } from "@packages/Application/FormatD.ComponentLoader/Resources/Private/TypeScript/AbstractComponentManager"

export class ContentWithHotspot {

	protected logger: Logger

	protected draggableHotspots: Hotspots|undefined = undefined

	constructor(logger: Logger) {
		this.logger = logger
	}

	getDraggableHotspotsNodeTypes(domSection: HTMLElement): string[] {
		return ['FormatD.HotspotEditor:Content.Hotspot', 'FormatD.HotspotContent:Content.HotspotWithLayer']
	}

	createDraggableHotspots(domSection: HTMLElement) {
		return new Hotspots(domSection, this.getDraggableHotspotsNodeTypes(domSection));
	}

	initialize(domSection: HTMLElement) {
		// init backend
		this.initializeBackend(domSection)
		// init frontend
		const hotspotAreas = <NodeListOf<HTMLElement>>domSection.querySelectorAll('.hotspots-area');
		if (hotspotAreas.length < 1) return;

		this.initializeFrontend(domSection, hotspotAreas)
	}

	initializeBackend(domSection: HTMLElement) {
		this.draggableHotspots = this.createDraggableHotspots(domSection)
	}

	initializeFrontend(domSection: HTMLElement, hotspotAreas: NodeListOf<HTMLElement>) {
		this.logger.log('initialized for: ', domSection);

		hotspotAreas.forEach((hotspotArea) => {
			this.initializeHotspotArea(hotspotArea)
		});
	}

	getLayersForHotspotArea(hotspotArea: HTMLElement) {
		return Array.from<HTMLElement>(hotspotArea.querySelectorAll('.hotspot-layer'))
	}

	initializeHotspotArea(hotspotArea: HTMLElement) {
		this.logger.log('initializing hotspot area', hotspotArea);

		const layers = this.getLayersForHotspotArea(hotspotArea)
		layers.forEach((layer) => {
			this.initializeLayer(hotspotArea, layer)
		});
		if (layers.length > 0) {
			this.handleClickOutsideShowroomLayer(hotspotArea, layers);
		}
	}

	initializeLayer(hotspotArea: HTMLElement, layer: HTMLElement) {
		this.logger.log('initializing hotspot layer', layer);
		layer.querySelector('.hotspot-close').addEventListener('click', _ => {
			this.deactivateHotspot(layer.dataset.hotspotId, hotspotArea);
		});
		const hotspot = <HTMLElement>hotspotArea.querySelector('.hotspot[data-hotspot-id="' + layer.dataset.hotspotId + '"]');
		this.logger.log('initializing corresponding layer hotspot', hotspot);
		hotspot.addEventListener(window.__ComponentLoaderComponentRegistry.context.isBackend() ? 'contextmenu' : 'click', (event) => {
			event.preventDefault();
			this.activateHotspot(hotspot.dataset.hotspotId, hotspotArea);
		});

		return hotspot
	}

	/**
	 * @param {string} hotspotId
	 * @param {HTMLElement} container
	 */
	activateHotspot(hotspotId, container) {
		this.logger.log('Activating hotspot', hotspotId);

		// disable hotspot dragging in backend:
		this.draggableHotspots['setEditable'](false); // setEditable is private...why?

		const layer = container.querySelector('.hotspot-layer[data-hotspot-id="' + hotspotId + '"]');
		this.logger.log('Activating layer', layer);
		layer.classList.toggle('active');
		this.toggleHotspotsVisibility(container);
	}

	/**
	 * @param {string} hotspotId
	 * @param {HTMLElement} container
	 */
	deactivateHotspot(hotspotId, container) {
		this.logger.log('Deactivating hotspot', hotspotId);

		const layer = container.querySelector('.hotspot-layer[data-hotspot-id="' + hotspotId + '"]');
		this.logger.log('Deactivating layer', layer);
		layer.classList.toggle('active');

		// enable hotspot dragging in backend:
		this.draggableHotspots['setEditable'](true); // setEditable is private...why?
		this.toggleHotspotsVisibility(container);
	}

	/**
	 * @param {HTMLElement} container
	 * @param {NodeListOf<Element>}layers
	 */
	handleClickOutsideShowroomLayer(container, layers) {
		if (!window.__ComponentLoaderComponentRegistry.context.isBackend()) {
			document.addEventListener('click', (event) => {
				for(const layer of layers) {
					if(!layer.classList.contains('active') || !layer.contains(event.target)) {
						continue
					}
					if(event.target instanceof HTMLElement && event.target.closest('.hotspot') === null) {
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
		const hotSpots = container.querySelectorAll('.hotspot');
		hotSpots.forEach(hotSpot => hotSpot.classList.toggle('hidden'));
	}
}


export default class ContentWithHotspotsComponentManager extends AbstractComponentManager {
	initialize(domSection: HTMLElement) {
		const logger = new Logger('ContentWithHotspots');

		const contentWithHotspots = new ContentWithHotspot(logger)
		contentWithHotspots.initialize(domSection)
	}
}
