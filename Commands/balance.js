const Command = require('../Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Get the balance of a user.',
            aliases: ['bal'],
            guildOnly: true,
            args: ['[user]']
        });
    }

    async run({ client, message, channel, member, guild, args }) {
        const id = args || member.id;
        const balance = await client.unb.getUserBalance(guild.id, id);
        return await channel.send(`${balance.user_id} ${balance.cash} ${balance.bank}`);
    }
}