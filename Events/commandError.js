const EventHandler = require('../Structures/EventHandler');

module.exports = class extends EventHandler {
    async run(error, command, message) {
        console.log(`[Command ${command.name} Error]`, error);
        const details = `${message.author.id} had a command error.\n\`${message.content}\`\n\n${require('util').inspect(error)}`
        await this.client.devLog(details, `Command ${command.name} Error`).catch(err => null);
    }
}