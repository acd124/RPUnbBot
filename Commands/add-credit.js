const Command = require('../Structures/Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Request more credits',
            guildOnly: true
        });
    }

    /**
     * 
     * @param {Object} context
     * @param {import('../index.js')} context.client
     * @param {import('discord.js').Message} context.message
     * @param {import('discord.js').TextChannel} context.channel
     * @param {import('discord.js').GuildMember} context.member
     * @param {import('discord.js').Guild} context.guild
     * @param {string} context.args
     */
    // @ts-ignore
    async run({ client, message, channel, member, guild, args }) {
        const questions = require('../credit-questions.json');
        const answers = [];

        const mess = await channel.send('Collecting information now.');

        const chan = await message.author.createDM();
        if (!(await chan.send('To request additional credits, you\'ll need to answer a few questions first.').catch(e => null)))
            return await mess.edit(':x: I was unable to dm you, make sure your dms are open for this server.');

        // message.author.awaiting = true;
        for (const { label, question, number } of questions) {
            try {
                answers.push(label + ': ' + (await this.client.getResponse(chan, message.author, question, number)));
            } catch (err) {
                // delete message.author.awaiting;
                await mess.edit(':x: Request failed');
                if (err.message === 'Too many tries') {
                    return await chan.send(':x: Too many attempts, command cancelled.');
                }
                if (err instanceof require('discord.js').Collection) {
                    return await chan.send(':x: Timed out, command cancelled.');
                }
                return await chan.send(':x: Something went wrong with that, you\'ll have to try again once this is fixed');
            }
        }

        const amount = answers.splice(1, 1);

        // delete message.author.awaiting;
        try {
            const user = await client.users.fetch('796886169295519796');
            await user.send(
                `User ${member.user.tag} (${member.id}) requests ${amount.slice(2)} credits\n` +
                answers.join('\n')
            );
        } catch (err) {
            await mess.edit(':x: Request failed');
            return await chan.send('Unfortunately I was unbable to send the request, please contact the owner about this.');
        }

        await mess.edit('<:checkmark:691859971108896829> Successfully requested.');
        return await chan.send('Thank you for answering the questions, the request has been made.');
    }
}