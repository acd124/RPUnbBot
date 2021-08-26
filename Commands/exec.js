const Command = require('../Command.js');

module.exports = class extends Command {
    constructor(client, name) {
        super(client, name, {
            description: 'Developer only command for testing.',
            aliases: ['ex'],
            developer: true,
            hidden: true,
            args: ['[script]']
        });
    }

    async run({ client, message, channel, member, guild, args }) {
        const exec = require('util').promisify(require('child_process').exec);
        const utilInspect = require('util').inspect;

        let result;
        try {
            result = await exec(args).then(out => out.stdout + '\n' + out.stderr);
        } catch (err) {
            result = utilInspect(err);
        }

        if (result.length > 4080 || result.includes('```')) {
            await channel.send({
                content: `Too big 😩\nlength: ${result.length}\ntime: <t:${Date.now() / 1000 | 0}:R>`,
                files: [{ name: 'result.js', attachment: Buffer.from(result) }]
            });
        } else {
            await channel.send({
                embeds: [{
                    title: `<t:${Date.now() / 1000 | 0}:R>`,
                    color: 237052,
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