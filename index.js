const { Client, Intents } = require('discord.js');
const { Client: UnbClient } = require('unb-api');
const config = require('./config.json');
const Store = require('./Structures/Store.js');

class RPUnbBot extends Client {
    constructor() {
        super({
            allowedMentions: { parse: [] },
            invalidRequestWarningInterval: 500,
            partials: ['MESSAGE', 'CHANNEL'],
            // @ts-ignore
            presence: config.presence,
            intents: Object.values(Intents.FLAGS).reduce((acc, p) => acc | p, 0),
        });
        this.unb = new UnbClient(config.unbToken);
        this.config = config;

        this.commands = new Store('./Commands');
        this.commands.load(this, Store.fileName);
        
        this.events = new Store('./Events');
        this.events.load(this, Store.fileName);
    }

    updateConfig(newData) {
        const json = JSON.stringify(newData, null, 4);
        require('fs').writeFileSync('./config.json', json);
        this.config = require('./config.json');
    }

    readableString(string) {
        return string.split('_').map(s => s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
    }

    async devLog(details, title) {
        for (const dev of this.config.developers) {
            const user = await this.users.fetch(dev).catch(err => null);
            if (user) await user.send({
                content: details.length < 4080 ? null : `${title} <t:${Date.now() / 1000 | 0}:R>`,
                embeds: details.length < 4080 ? [{
                    title: `${title} <t:${Date.now() / 1000 | 0}:R>`,
                    color: title.includes('Error') || title.includes('Leave') ? 15216652 : 237052,
                    description: '```js\n' + details + '\n```',
                    footer: {
                        text: `\u200b`,
                    },
                    timestamp: new Date()
                }] : [],
                files: details.length < 4080 ? [] : [{ name: 'error.js', attachment: Buffer.from(details) }]
            }).catch(err => null);
        }
    }

    async ownerLog(data) {
        for (const owner of this.config.owners) {
            const user = await this.users.fetch(owner);
            await user.send(data);
        }
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
                max: 1, filter: m => m.author.id === author.id, time: 5 * 60 * 1000, errors: ['time']
            }).then(m => m.first()?.content);
            if (!number) return result;
            if (!isNaN(Number(result.replace(/,/g, '')))) return result;
        }
        throw new Error('Too many tries');
    }

    async login(token) {
        const result = await super.login(token);
        await this.devLog(`${this.user.tag} online`, '');
        return result;
    }
}

module.exports = RPUnbBot;

new RPUnbBot().login(config.token);