export default class Logger {

	protected scope: string
	protected enabled: boolean
	protected filterScopes: string[]

	constructor(scope) {
		this.scope = scope;
		this.enabled = window.__ComponentLoaderComponentRegistry.context.isDevelopment;
		this.filterScopes = []; // NO filter active
		//this.filterScopes = ['ModalEnabled']; // display only ModalEnabled Scope
	}

	/**
	 * Logs all provided arguments if enabled
	 */
	log(...args) {
		if (this.enabled && (this.filterScopes.length === 0 || this.filterScopes.indexOf(this.scope) !== -1)) {
			console.log(this.scope + ':', ...args);
		}
	}

    /**
     * Logs all provided arguments
     */
    error(...args) {
        console.error(this.scope + ':', ...args);
    }

}
