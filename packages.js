const chalk = require('chalk');
const semver = require('semver');
const ProgressBar = require('progress');
const { execSync } = require('child_process');
const logSymbols = require('log-symbols');
const log = console.log;

class Packages {
    constructor() {
        this.dev = null;
		this.dep = null;
		this.longest = 12;
		this.latest = 'up-2-d8';
		this.everything = false;
		this.stable = [
			'npm i -D ',
			'npm i -S ',
		];
		this.recent = [
			'npm i -D ',
			'npm i -S ',
		];
	}

	getMax(obj) {
		for(const key in obj) this.longest = Math.max(this.longest, key.length);
	}

	getLongestLength() {
		if(this.dev) { this.getMax(this.dev); }
		if(this.dep) { this.getMax(this.dep); }
	}
	
	store(key, d, type, b) {
		const current = semver.valid(semver.coerce(d[key]));
		let maj = semver.valid(semver.coerce(execSync(`npm v ${key} version`, { encoding: 'utf-8' })));
		maj = (maj === current) ? this.latest : maj;
		let min; 
		if(maj === this.latest) min = this.latest;
		else if(maj.split('.')[0] <= current.split('.')[0]) min = maj;
		else {
			min = execSync(`npm v ${key}@${current.split('.')[0]} version`, { encoding: 'utf-8' }).split('\n');
			min = semver.valid(semver.coerce(min[min.length-2]));
			min = (min === current) ? this.latest : min;
		};
		if(min !== this.latest || maj !== this.latest) { this.everything = true; }
		type[key] = { curr: current, minor: min, major: maj }; b.tick();
	}

	storeData(dev, dep) {
		const devLen = (dev) ? Object.keys(dev).length : 0;
		const depLen = (dep) ? Object.keys(dep).length : 0;
		const bar = new ProgressBar('Retrieving Package Versions [:bar] :percent', {
			total: (devLen + depLen), 
			complete: chalk.green('='),
			incomplete: '-',
			width: 25,
		});
        if(!this.dev && dev) { 
			this.dev = {};
			for(const key in dev) this.store(key, dev, this.dev, bar); 
		};
        if(!this.dep && dep) {
			this.dep = {};
			for(const key in dep) this.store(key, dep, this.dep, bar);
		};
	}

	concatPackages(t) {
		const type = (t === 'stable') ? 'minor' : 'major';
		for(const key in this.dev) {
			const val = this.dev[key][type];
			if(val !== this.latest) this[t][0] += `${key}@${val} `;
		}
		for(const key in this.dep) {
			const val = this.dep[key][type];
			if(val !== this.latest) this[t][1] += `${key}@${val} `;
		}
	}
	
	title(type, num, n) {
        log(`\n${chalk.underline.bold(type)}\n`);
        log(chalk.magenta.bold('Name'.padEnd(num)), chalk.magenta.bold('Current'.padEnd(n)), chalk.magenta.bold('Stable'.padEnd(n)), chalk.magenta.bold('Most Recent'.padEnd(n)));
	}
	
	printStyle(obj, num, n, fn = norm) {
		for(const key in obj) { 
			if(fn(obj[key])) {
				let { curr, minor, major } = obj[key];
				minor = (minor === this.latest) ? chalk.green(minor.padEnd(n)) : chalk.yellow(minor.padEnd(n));
				major = (major === this.latest) ? chalk.green(major.padEnd(n)) : chalk.red(major.padEnd(n));
				log(key.padEnd(num), curr.padEnd(n), minor, major);
			}
		} log();
	}

    printDep(fn = norm) {
        if(this.dep) {
			this.title('dependencies', this.longest + 3, 12, fn);
			this.printStyle(this.dep, this.longest + 3, 12, fn);
        } else log(chalk.black.bgGreen(`\n No dependencies `));
	}
	
	printDev(fn = norm) {
        if(this.dev) {
			this.title('devDependencies', this.longest + 3, 12, fn);
			this.printStyle(this.dev, this.longest + 3, 12, fn);
        } else log(chalk.black.bgGreen(`\n No devDependencies `));
	}

	printAll(fn = norm) {
		if(this.everything === true) {
			this.printDev(fn);
			this.printDep(fn);
		} else {
			log(chalk.bold(`\n${logSymbols.success} Everything is up to date!\n`));
			process.exit(0);
		};
	}
}

const norm = (x) => { return true; };

module.exports = Packages;