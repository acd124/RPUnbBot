const { Channel } = require('discord.js');
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
        const questions = require('../questions.json');
        const answers = [message.author.tag];

        const mess = await channel.send('Starting the registration process now.');

        const chan = await message.author.createDM();
        if (!(await chan.send('Hello and welcome to the season end data collection, please be sure to insert the right information.\n' +
            'If you are unsure about something reach out to your teamleader or the managment').catch(e => null)))
            return await mess.edit(':x: I was unable to dm you, make sure your dms are open for this server.');

        for (const { question, number } of questions) {
            try {
                answers.push(await this.getResponse(chan, message.author, question, number));
            } catch (err) {
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

        await this.client.ownerLog(answers.join(', '));
        await mess.edit('<:checkmark:691859971108896829> Successfully registered.');
        return await chan.send('Thank you for the information, I\'ve sent it to be registered');
    }

    /**
     * 
     * @param {import('discord.js').DMChannel} channel
     * @param {import('discord.js').User} author
     * @param {string} question 
     * @returns {Promise<string>}
     */
    async getResponse(channel, author, question, number = false) {
        for (let i = 0; i < 20; i++) {
            await channel.send((i ? ':x: That\'s not a number, please try again.\n' : '') + question);
            const result = await channel.awaitMessages({
                max: 1, filter: m => m.author.id === author.id, time: 30000, errors: ['time']
            }).then(m => m.first()?.content);
            if (!number) return result;
            if (!isNaN(Number(result))) return result;
        }
        throw new Error('Too many tries');
    }
}