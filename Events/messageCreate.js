const EventHanlder = require('../Structures/EventHandler.js');

module.exports = class extends EventHanlder {
    async run(message) {
        if (message.channel.type === 'DM' && message.author.id !== this.client.user.id && !this.client.config.developers.includes(message.author.id))
            await this.client.devLog(message.content, `DM from ${message.author.tag} (${message.author.id})`);
        if (message.author.bot) return;
        if (message.guild && !message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) return;

        if (message.content.match(`<@!?${this.client.user.id}>`)) {
            return await message.channel.send(
                `My current prefix is \`${this.client.config.prefix}\`\n`
            );
        }

        const prefixUsed = message.content.match(new RegExp(
            `^(?:<@!?${this.client.user.id}>|${this.client.config.prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`
        ))?.[0];
        if (!prefixUsed) return;
        
        const commandContent = message.content.slice(prefixUsed.length).trim();
        const commandName = commandContent.split(' ')[0];
        /** @type {import('../Structures/Command.js')} */
        const command = this.client.commands.find(c => c.match(commandName));
        if (!command) return;

        if (command.developer && !this.client.config.developers.includes(message.author.id)) return;
        if (command.owner && !this.client.config.owners.includes(message.author.id)) return;

        if (command.guildOnly && message.channel.type === 'DM') return;

        if (message.guild && command.permissions.some(p => !message.channel.permissionsFor(message.member).has(p))) {
            return !command.hidden && await message.channel.send(
                `You need the ${this.client.readableString(
                    command.permissions.find(p => !message.channel.permissionsFor(message.member).has(p))
                )} permission to run this command.`
            );
        }

        if (message.guild && command.botPermissions.some(p => !message.channel.permissionsFor(this.client.user).has(p))) {
            return await !command.hidden && message.channel.send(
                `I need the ${this.client.readableString(
                    command.botPermissions.find(p => !message.channel.permissionsFor(this.client.user).has(p))
                )} permission to run this command.`
            );
        }

        const args = commandContent.slice(commandName.length).trim();

        try {
            await command.run({
                client: this.client,
                message,
                channel: message.channel,
                member: message.member,
                guild: message.guild,
                args
            });
        } catch (err) {
            await message.channel.send(':x: Something went wrong while trying to run that command');
            this.client.emit('commandError', err, command, message);
        }
    }
}