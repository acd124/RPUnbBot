const Command = require('../Structures/Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Add an amount to many users\' cash balance at once. ' + 
                'Format for each update is `userID amount`, and each update should be separated by a new line',
            aliases: ['mass-pay'],
            guildOnly: true,
            permissions: ['ADMINISTRATOR'],
            args: ['[<user> <amount>], ...']
        });
    }

    async run({ client, message, channel, member, guild, args }) {
        const balances = args.split('\n').map(s => {const t = s.split(' '); const n = t.pop(); return [t.join(' '), n]});

        const lengthError = balances.findIndex(b => b.length < 2) + 1;
        const numberError = balances.findIndex(([u, n]) => !n.match(/^-?\d+$/)) + 1;

        if (lengthError) return await channel.send(
            `Line ${lengthError} only has 1 part. I need the user and the amount separated by a space.`
        );
        if (numberError) return await channel.send(
            `Line ${numberError} has an amount that is not a valid number.`
        );

        const mess = await channel.send('<a:loading:694427106490318938> working on it');

        const errors = (await Promise.all(balances.map(async ([u, n], i) => {
            try {
                return await client.unb.editUserBalance(
                    guild.id,
                    (await guild.members.fetch(u.match(/\d{17,21}/)?.[0]).then(m => m.id).catch(err => null)) ||
                        (await guild.members.search({ query: u.split('#')[0] })
                        .then(mem => mem.find(m => u.split('#')[1].trim() ? m.user.discriminator === u.split('#')[1].trim() : true)?.id)),
                    { cash: Number(n) }
                ).then(() => null).catch(e => {return i + 1});
            } catch(err) {
                return i + 1;
            }
        }))).filter(e => e);

        await mess.edit('<:checkmark:691859971108896829> Done')
        return await channel.send(
            `${errors.length} Errors\n${balances.length - errors.length} Successful` +
            (errors.length ? `\nErrors on lines: ${errors.join(', ')}` : '')
        );
    }
}