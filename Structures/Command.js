class Command {
	/**
	 * 
	 * @param {import('../index.js')} client 
	 * @param {string} name 
	 * @param {Object} [options={}]
	 * @param {string} [options.description='N/A']
	 * @param {string[]} [options.aliases=[]]
	 * @param {boolean} [options.guildOnly=false]
	 * @param {boolean} [options.owner=false]
	 * @param {boolean} [options.developer=false]
	 * @param {boolean} [options.hidden=false]
	 * @param {string[]} [options.permissions=[]]
	 * @param {string[]} [options.botPermissions=[]]
	 * @param {string[]} [options.args=[]]
	 */
	constructor(client, name, options = {}) {
		this.client = client;
		this.name = name.toLowerCase();
		this.description = options.description || 'N/A';
		this.aliases = (options.aliases || []).map(alias => alias.toLowerCase());
		this.guildOnly = !!options.guildOnly;
		this.owner = !!options.owner;
        this.developer = !!options.developer;
		this.hidden = !!options.hidden;
		this.permissions = options.permissions || [];
		this.botPermissions = options.botPermissions || [];
		this.args = options.args || [];
		this.usage = this.args.join(' ');
	}

	async run({ client, message, channel, member, guild, args }) {
		throw new Error(`${this.name} has not implemented this method`);
	}
    
	match(string) {
		string = string.toLowerCase().replace(/-/g, '');
		return string === this.name.replace(/-/g, '') || this.aliases.some(alias => string === alias.replace(/-/g, ''));
	}
}

module.exports = Command;