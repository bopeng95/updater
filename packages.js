const chalk = require('chalk');

class Packages {
    constructor() {
        this.dev = null;
		this.dep = null;
		this.longest = 12;
	}

	getMax(obj) {
		for(const key in obj) this.longest = Math.max(this.longest, key.length);
	}

	getLongestLength() {
		if(this.dev) { this.getMax(this.dev); }
		if(this.dep) { this.getMax(this.dep); }
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