const Command = require('../Structures/Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Withdraw money to a different account.',
            aliases: ['with'],
            guildOnly: true,
            args: ['<amount>', '<account>']
        });
    }

    async run({ client, message, channel, member, guild, args }) {
        const list = args.split(' ');
        const amount = Math.abs(parseInt(list.shift(), 10));
        const account = list.join(' ');

        if (isNaN(amount)) return await channel.send(':x: Invalid amount');
        const bal = await client.unb.getUserBalance(guild.id, member.id);
        if (bal.cash < amount) return await channel.send(`:x: You don't have that much cash, you only have ${bal.cash} on hand.`);
        if (!account) return await channel.send(':x: Make sure to specify what account you want to withdraw to.');
        await client.unb.editUserBalance(guild.id, member.id, { cash: -amount });
        console.log('withdraw', member.id, amount);
        for (const owner of client.config.owners) {
            const user = await client.users.fetch(owner);
            await user.send(`User ${member.user.tag} (${member.id}) wants to withdraw ${amount} to ${account}.`);
        }
        return await channel.send(`Withdrew ${amount}. Check back with <@!${client.config.owners[0]}> in 24h if the amount is not paid out`);
    }
}