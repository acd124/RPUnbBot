const { existsSync, readdirSync } = require('fs');
const { Collection } = require('discord.js');

class Store extends Collection {
    static fileName = {};
    static directory = {};
    static subDirectory = {};
    static thisStore = {};

    /**
     * Create a store of objects from a directory
     * @param {string} directory - The path to the directory to read
     * @param {boolean} subDirectory - If the elements of the directory should be directories
     */
    constructor(directory, subDirectory = false) {
        super();

        this.directory = require('path').join(process.cwd(), directory);
        this.subDirectory = !!subDirectory;
    }

    /**
     * Load in the files from this store with a set of args, static properties of this class are replaced with the variable values
     * @param  {...any} args - The arguments to provide to the constructors
     */
    load(...args) {
        if (!existsSync(this.directory)) throw new Error(`Invalid Store directory: ${this.directory}`);
        const list = readdirSync(this.directory, { withFileTypes: true }).filter(f => this.subDirectory ? f.isDirectory() : f.isFile()).map(f => f.name);
        if (this.subDirectory) {
            list.forEach(name => this.loadDirectory(readdirSync(`${this.directory}/${name}`), name, ...args));
        } else {
            this.loadDirectory(list, undefined, ...args);
        }
    }

    /**
     * Load in a directory
     * @private
     * @param {string[]} list - The list of file names to load
     * @param {string} [name] - The name of the subDirectory if it is a subDirectory
     * @param  {...any} args - The arguments to provide the constructs
     */
    loadDirectory(list, name, ...args) {
        list.filter(file => file.endsWith('.js')).forEach(file => this.loadFile(file, name, ...args));
    }

    /**
     * Load in a single file
     * @private
     * @param {string} file - The name of the file to load
     * @param {string} [subDirectory] - The name of the subDirectory if reading subDirectories
     * @param {...any} args - The arguments to provide the constructs
     */
    loadFile(file, subDirectory, ...args) {
        const Item = require(`${this.directory}${subDirectory ? '/' + subDirectory : ''}/${file}`);
        const name = (this.subDirectory ? file.toLowerCase() : file).replace('.js', '');
        this.set(name, new Item(...args.map(arg => this.parseArg(arg, name, subDirectory))));
    }

    /**
     * Replace the static constants with the associated variables 
     * @private
     * @param {any} arg - The argument to parse
     * @param {string} file - The name of the file
     * @param {string} [subDirectory] - The name of the subdirectory
     * @returns {any}
     */
    parseArg(arg, file, subDirectory) {
        switch (arg) {
            case Store.fileName: return file;
            case Store.thisStore: return this;
            case Store.directory: return this.directory;
            case Store.subDirectory: return subDirectory;
            default: return arg;
        }
    }

    /**
     * Apply all elements of this Store as properties of an object, should be called after load()
     * @param {Object} applyTo - The object to apply the properties to
     * @param {string[]} [ignore=[]] - A list of construct names to ignore
     */
    applyProperties(applyTo, ignore = []) {
        for (const [key, value] of this) {
            if (ignore.includes(key)) continue;
            applyTo[key] = value;
        }
    }
    
    toString() {
        return `[${this.constructor.name}<${this.directory}>]`;
    }
}

module.exports = Store;