const Command = require('../Structures/Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Register your information.',
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
        const questions = require('../data-questions.json');
        const now = new Date();
        const answers = [[now.getDate(), now.getMonth(), now.getFullYear()].join('.'), message.author.tag];

        const mess = await channel.send('Starting the registration process now.');

        const chan = await message.author.createDM();
        if (!(await chan.send('Hello and welcome to the season end data collection, please be sure to insert the right information.\n' +
            'If you are unsure about something reach out to your teamleader or the managment').catch(e => null)))
            return await mess.edit(':x: I was unable to dm you, make sure your dms are open for this server.');

        // message.author.awaiting = true;
        for (const { question, number } of questions) {
            try {
                answers.push(await this.client.getResponse(chan, message.author, question, number));
            } catch (err) {
                // delete message.author.awaiting;
                await mess.edit(':x: Registration failed');
                if (err.message === 'Too many tries') {
                    return await chan.send(':x: Too many attempts, command cancelled.');
                }
                if (err instanceof require('discord.js').Collection) {
                    return await chan.send(':x: Timed out, command cancelled.');
                }
                return await chan.send(':x: Something went wrong with that, you\'ll have to try again once this is fixed');
            }
        }
        // delete message.author.awaiting;

        await this.client.ownerLog(answers.join(', '));
        await mess.edit('<:checkmark:691859971108896829> Successfully registered.');
        return await chan.send('Thank you for the information, I\'ve sent it to be registered');
    }
}