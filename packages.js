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
		const current = semver.valid(semver.coerce(d[key]));
		let maj = semver.valid(semver.coerce(execSync(`npm v ${key} version`, { encoding: 'utf-8' })));
		maj = (maj === current) ? this.latest : maj;
		let min; 
		b.tick();
		if(maj === this.latest) min = this.latest;
		else if(maj.split('.')[0] <= current.split('.')[0]) min = maj;
		else {
			min = execSync(`npm v ${key}@${current.split('.')[0]} version`, { encoding: 'utf-8' }).split('\n');
			min = semver.valid(semver.coerce(min[min.length-2]));
			min = (min === current) ? this.latest : min;
		}; b.tick();
		type[key] = { curr: current, minor: min, major: maj };
	}

	storeData(dev, dep) {
		const devLen = (dev) ? Object.keys(dev).length : 0;
		const depLen = (dep) ? Object.keys(dep).length : 0;
		console.log();
		const bar = new ProgressBar('Retrieving Data [:bar] :percent', {
			total: (devLen + depLen) * 3 + 3, 
			complete: chalk.green('='),
			incomplete: chalk.red('-'),
			width: 25,
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
        console.log(chalk.magenta.bold('Name'.padEnd(num)), chalk.magenta.bold('Current'.padEnd(n)), chalk.magenta.bold('Stable'.padEnd(n)), chalk.magenta.bold('Most Recent'.padEnd(n)));
	}
	
	printStyle(obj, num, n) {
		for(const key in obj) { 
			let { curr, minor, major } = obj[key];
			minor = (minor === this.latest) ? chalk.green(minor.padEnd(n)) : chalk.yellow(minor.padEnd(n));
			major = (major === this.latest) ? chalk.green(major.padEnd(n)) : chalk.red(major.padEnd(n));
			console.log(key.padEnd(num), curr.padEnd(n), minor, major);
		} console.log();
	}

    printDep() {
        if(this.dep) {
			this.title('dependencies', this.longest + 3, 12);
			this.printStyle(this.dep, this.longest + 3, 12);
        } else console.log(chalk.black.bgGreen(`\n No dependencies `));
	}
	
	printDev() {
        if(this.dev) {
			this.title('devDependencies', this.longest + 3, 12);
			this.printStyle(this.dev, this.longest + 3, 12);
        } else console.log(chalk.black.bgGreen(`\n No devDependencies `));
	}

	printAll() {
		this.printDev();
		this.printDep();
	}
}

module.exports = Packages;