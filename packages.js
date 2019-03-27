const chalk = require('chalk');
const semver = require('semver');
const ProgressBar = require('progress');
const { execSync } = require('child_process');

class Packages {
    constructor() {
        this.dev = null;
		this.dep = null;
		this.longest = 12;
		this.latest = 'up-2-d8';
	}

	getMax(obj) {
		for(const key in obj) this.longest = Math.max(this.longest, key.length);
	}

	getLongestLength() {
		if(this.dev) { this.getMax(this.dev); }
		if(this.dep) { this.getMax(this.dep); }
	}
	
	store(key, d, type, b) {
		b.tick();
		const current = semver.valid(semver.coerce(d[key])); b.tick();
		let maj = semver.valid(semver.coerce(execSync(`npm v ${key} version`, { encoding: 'utf-8' }))); b.tick();
		maj = (maj === current) ? this.latest : maj; b.tick();
		let min = (maj === this.latest) ? this.latest : execSync(`npm v ${key}@${current.split('.')[0]} version`, { encoding: 'utf-8' }).split('\n'); b.tick();
		if(min !== this.latest) min = semver.valid(semver.coerce(min[min.length-2])); b.tick();
		type[key] = { curr: current, minor: min, major: maj }; b.tick();
	}

	storeData(dev, dep) {
		const devLen = (dev) ? Object.keys(dev).length : 0;
		const depLen = (dep) ? Object.keys(dep).length : 0;
		console.log();
		const bar = new ProgressBar('Retrieving Data [:bar] :percent :current/:total', {
			total: (devLen + depLen) * 7 + 3, 
			complete: chalk.green('='),
			incomplete: chalk.red('-'),
			width: 30,
		}); bar.tick();
        if(!this.dev && dev) { 
			this.dev = {};
			for(const key in dev) this.store(key, dev, this.dev, bar); 
		} bar.tick();
        if(!this.dep && dep) {
			this.dep = {};
			for(const key in dep) this.store(key, dep, this.dep, bar);
		}; bar.tick();
	}
	
	title(type, num, n) {
        console.log(`\n${chalk.underline.bold(type)}\n`);
        console.log(chalk.magenta.bold('Name'.padEnd(num)), chalk.magenta.bold('curr'.padEnd(n)), chalk.magenta.bold('minor'.padEnd(n)), chalk.magenta.bold('major'.padEnd(n)));
	}
	
	printStyle(obj, num, n) {
		for(const key in obj) {
			const { curr, minor, major } = obj[key];
			console.log(key.padEnd(num), curr.padEnd(n), chalk.yellow(minor.padEnd(n)), chalk.red(major.padEnd(n)));
		} console.log();
	}

    printDep() {
        if(this.dep) {
			this.title('dependencies', this.longest + 3, 12);
			this.printStyle(this.dep, this.longest + 3, 12);
        } else console.log(chalk.black.bgGreen(`\nNo dependencies`));
	}
	
	printDev() {
        if(this.dev) {
			this.title('devDependencies', this.longest + 3, 12);
			this.printStyle(this.dev, this.longest + 3, 12);
        } else console.log(chalk.black.bgGreen(`\nNo devDependencies`));
	}

	printAll() {
		this.printDev();
		this.printDep();
	}
}

module.exports = Packages;