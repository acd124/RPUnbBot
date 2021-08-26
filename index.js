const { Client, Intents } = require('discord.js');
const { Client: UnbClient } = require('unb-api');
const config = require('./config.json');
const Store = require('./Store.js');

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
}

module.exports = RPUnbBot;

new RPUnbBot().login(config.token);