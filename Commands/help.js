const Command = require('../Structures/Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Find information about a command.',
            aliases: ['commands'],
            args: ['[command]'],
            botPermissions: ['EMBED_LINKS']
        });
    }

    async run({ client, message, channel, member, guild, args }) {
        if (!args) {
            return await channel.send({
                embeds: [{
                    color: 237052,
                    title: 'All Commands',
                    description: this.client.commands.map(a => a).filter(c => !c.hidden).map(c => c.name).join('\n')
                }]
            });
        } else {
            const command = this.client.commands.find(c => c.match(args));
            if (!command) return await channel.send(':x: I couldn\'t find that command');
            return await channel.send({
                embeds: [{
                    color: 237052,
                    title: command.name,
                    description: command.description,
                    fields: [
                        { name: 'usage', value: '`' + (command.name + ' ' + command.usage).trim() + '`' },
                        command.aliases.length ? { name: 'Aliases', value: command.aliases.map(a => '`' + a + '`').join(', ') } : null,
                        command.permissions.length ? { name: 'Permissions', value: command.permissions.map(p => this.client.readableString(p)).join(', ') } : null
                    ].filter(a => a)
                }]
            })
        }
    }
}