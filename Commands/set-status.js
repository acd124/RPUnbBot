const Command = require('../Structures/Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Set the bot status.',
            owner: true,
            hidden: true,
            args: ['<status>', '<type>', '<message>']
        });
    }

    async run({ client, message, channel, member, guild, args }) {
        const list = args.split(' ');
        const status = (list.shift() || '').toLowerCase();
        const type = (list.shift() || '').toUpperCase();
        const name = list.join(' ');

        if (!['online', 'idle', 'dnd', 'invisible'].includes(status))
            return await channel.send(`The status must be one of: online, idle, dnd, or invisible`);
        if (!['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'].includes(type))
            return await channel.send(`The type must be one of: playing, streaming, listening, watching, or competing`);

        await this.client.user.setPresence({ status, activities: [{ type, name }] });
        this.client.updateConfig(Object.assign(client.config, { presence: { status, activities: [{ type, name }] }}));
        return await channel.send('Status updated');
    }
}