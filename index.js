#!/usr/bin/env node
const path = require('path');
const Packages = require('./packages');
const { argv } = require('yargs');
const { cwd } = process;
const Aid = require('./helper');
const ipt = require('ipt');
const log = console.log;
const pkg = new Packages();

process.stdin.on('keypress', (ch, key) => {
    if(key && key.name === 'escape') { 
        log(Aid.out(`\ngoodbye (◕‿◕✿)`));
        process.exit(0);
    }
});

if(argv.v || argv.version) { 
    log(Aid.version());
    process.exit(0); 
}

const all = (argv.all || argv.A) ? (item) => { return item; } : 
                                   (item) => { return item.major !== pkg.latest || item.minor !== pkg.latest; };
const location = (argv._[0]) ? path.join(cwd(), argv._[0]) : cwd();
const { devDependencies, dependencies } = Aid.retrievePackageInfo(location);

if(devDependencies === undefined && dependencies === undefined) { 
    log(Aid.error('No dependencies in this package.json'));
    process.exit(1);
}
pkg.storeData(devDependencies, dependencies);
pkg.getLongestLength();
pkg.printAll(all);

const input = ['stable','recent', 'nothing'];
ipt(input, { message: 'pick something' })
.then(picked => Aid.processUserRequest(picked[0], input, pkg, location))
.catch(err => { 
    log(Aid.error(err.message)); 
    process.exit(1);
});