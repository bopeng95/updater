#!/usr/bin/env node
const path = require('path');
const Packages = require('./packages');
const { argv } = require('yargs');
const { cwd } = process;
const Aid = require('./helper');
const { execSync } = require('child_process');
const pkg = new Packages();

process.stdin.on('keypress', (ch, key) => {
    if(key && key.name === 'escape') { Aid.out('goodbye (◕‿◕✿)'); }
});

if(argv.v || argv.version) { Aid.version(); }

const location = (argv._[0]) ? path.join(cwd(), argv._[0]) : cwd();
const { devDependencies, dependencies } = Aid.retrievePackageInfo(location);

if(devDependencies === undefined && dependencies === undefined) Aid.error('No dependencies in this package.json');
pkg.storeData(devDependencies, dependencies);
pkg.getLongestLength();
pkg.printAll();

