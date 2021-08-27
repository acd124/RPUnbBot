const Command = require('../Structures/Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Add an amount to many users\' cash balance at once. ' + 
                'Format for each update is `userID amount`, and each update should be separated by a new line',
            aliases: ['mass-pay'],
            guildOnly: true,
            permissions: ['ADMINISTRATOR'],
            args: ['[<userID> <amount>], ...']
        });
    }

    async run({ client, message, channel, member, guild, args }) {
        const balances = args.split('\n').map(s => s.split(' '));

        const lengthError = balances.findIndex(b => b.length !== 2) + 1;
        const numberError = balances.findIndex(([u, n]) => !u.match(/\d{17,21}/) || !n.match(/-?\d+/)) + 1;

        if (lengthError) return await channel.send(
            `Line ${lengthError} does not have exactly 2 parts. I need the user id and the amount separated by a space.`
        );
        if (numberError) return await channel.send(
            `Line ${numberError} has a problem. Either the user id or amount is not a valid number.`
        );

        const errors = (await Promise.all(balances.map(async ([u, n], i) => {
            return await client.unb.editUserBalance(guild.id, u.match(/\d{17,21}/)[0], { cash: Number(n) })
                .then(() => null).catch(() => i + 1);
        }))).filter(e => e);

        return await channel.send(
            `${errors.length} Errors\n${balances.length - errors.length} Successful` +
            (errors.length ? `\nErrors on lines: ${errors.join(', ')}` : '')
        );
    }
}