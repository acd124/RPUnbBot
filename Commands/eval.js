const Command = require('../Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Developer only command for testing.',
            aliases: ['ev'],
            developer: true,
            hidden: true,
            args: ['[code]']
        });
    }

    async run({ client, message, channel, member, guild, args }) {
        const superagent = require('superagent');
        const utilInspect = require('util').inspect;

        let result, type;
        try {
            result = await eval(`(async () => {${args}\n})()`);
            type = typeof result;

            if (typeof result !== 'string') result = utilInspect(result);
        } catch (err) {
            result = utilInspect(err);
            type = 'error';
        }

        if (result.length > 4080 || result.includes('```')) {
            await channel.send({
                content: `Too big 😩\ntype: ${type}\nlength: ${result.length}\ntime: <t:${Date.now() / 1000 | 0}:R>`,
                files: [{ name: 'result.js', attachment: Buffer.from(result) }]
            });
        } else {
            await channel.send({
                embeds: [{
                    title: `type: ${type} <t:${Date.now() / 1000 | 0}:R>`,
                    color: type === 'error' ? 15216652 : 237052,
                    description: '```js\n' + result + '\n```',
                    footer: {
                        text: `length: ${result.length}`,
                    },
                    timestamp: new Date()
                }]
            });
        }
    }
}