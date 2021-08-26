const EventHandler = require('../EventHandler');

module.exports = class extends EventHandler {
    async run(error, event) {
        console.log(`[Event ${event.name} Error]`, error);
        const details = require('util').inspect(error);
        await this.client.devLog(details, `Event ${event.name} Error`).catch(err => null);
    }
}