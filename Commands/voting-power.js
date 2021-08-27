const Command = require('../Structures/Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Find out how much voting power you have.',
            aliases: ['vote-power'],
            guildOnly: true
        });
    }

    async run({ client, message, channel, member, guild, args }) {
        const balance = await client.unb.getUserBalance(guild.id, member.id);
        const total = (await client.unb.getGuildLeaderboard(guild.id)).reduce((a, c) => a + c.bank, 0);
        return await channel.send(`${balance.bank ? ((balance.bank / total) * 100).toFixed(2) : 0}%`);
    }
}