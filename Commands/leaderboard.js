const Command = require('../Structures/Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Get all balances.',
            aliases: ['lb'],
            guildOnly: true,
        });
    }

    async run({ client, message, channel, member, guild, args }) {
        const lb = await client.unb.getGuildLeaderboard(guild.id);
        const csv = lb.map(u => `${u.user_id}, ${u.cash}, ${u.bank}`).join('\n');
        return await channel.send({ files: [{ name: 'leaderboard.txt', attachment: Buffer.from(csv) }] });
    }
}