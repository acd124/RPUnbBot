class EventHandler {
    /**
     * A class to handle events safely
     * @param {import('./index.js')} client - The client object
     * @param {string} name - The name of this event handler
     * @param {Object} [options] - The options for the event handler
     * @param {import('events').EventEmitter} [options.emitter=client] - The source of the events
     * @param {string} [options.event=name] - The name of the event
     * @param {boolean} [options.disabled=false] - If the event handler should not start listening immediately
     */
    constructor(client, name, options = {}) {
        this.name = name;
        this.client = client;
        this.emitter = options.emitter || client;
        this.event = options.event || name;
        this.disabled = !!options.disabled;

        this._listener = this._run.bind(this);
        !this.disabled && this._listen();
    }

    /**
     * Overridden by each EventHandler
     * @param  {...any} args - The arguments supplied by the event
     */
    async run(...args) {
        throw new Error(`${this.name} has not implemented this method`);
    }

    /**
     * Turn on the EventHandler and start listening again
     */
    enable() {
        if (!this.disabled) return;
        this.disabled = false;
        this._listen();
    }

    /**
     * Turn off the EventHandler and stop listening
     */
    disable() {
        if (this.disabled) return;
        this.disabled = true;
        this._unlisten();
    }

    async _run(...args) {
        try {
            await this.run(...args);
        } catch (err) {
            if(!this.client.emit('eventError', err, this)) throw err;
        }
    }

    _listen() {
        this.emitter.on(this.event, this._listener);
    }

    _unlisten() {
        this.emitter.off(this.event, this._listener);
    }
}

module.exports = EventHandler;